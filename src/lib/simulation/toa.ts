import { SimpleTable } from '@oldschoolgg/toolkit';
import { UserStats, XpGainSource } from '@prisma/client';
import { bold } from 'discord.js';
import {
	calcPercentOfNum,
	calcWhatPercent,
	clamp,
	increaseNumByPercent,
	objectEntries,
	percentChance,
	randArrItem,
	randInt,
	reduceNumByPercent,
	roll,
	round,
	scaleNumber,
	sumArr,
	Time
} from 'e';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank, LootTable } from 'oldschooljs';

import { mahojiParseNumber, userStatsBankUpdate } from '../../mahoji/mahojiSettings';
import { mentionCommand } from '../commandMention';
import { Emoji } from '../constants';
import { getSimilarItems } from '../data/similarItems';
import { degradeItem } from '../degradeableItems';
import { GearStats, UserFullGearSetup } from '../gear/types';
import { trackLoot } from '../lootTrack';
import { MUserClass } from '../MUser';
import { setupParty } from '../party';
import { getMinigameEntity, getMinigameScore } from '../settings/minigames';
import { SkillsEnum } from '../skilling/types';
import { constructGearSetup, Gear } from '../structures/Gear';
import { ItemBank, MakePartyOptions, Skills } from '../types';
import { TOAOptions } from '../types/minions';
import {
	assert,
	channelIsSendable,
	formatDuration,
	formatSkillRequirements,
	itemNameFromID,
	randomVariation
} from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';
import getOSItem from '../util/getOSItem';
import itemID from '../util/itemID';
import resolveItems from '../util/resolveItems';
import { exponentialPercentScale } from '../util/smallUtils';
import { updateBankSetting } from '../util/updateBankSetting';
import { TeamLoot } from './TeamLoot';

const teamSizeScale: Record<number, number> = {
	1: 1.0,
	2: 1.9,
	3: 2.8,
	4: 3.4,
	5: 4.0,
	6: 4.6,
	7: 5.2,
	8: 5.8
};
const averageWTPLevel = { 0: 0, 1: 0, 2: 0, 3: 0 };

function scaleHP(base: number, raidLevel: number, teamSize: keyof typeof teamSizeScale, pathLevel: number): number {
	let pathMultiplier = 1.0;
	if (pathLevel > 0) {
		pathMultiplier = 1.03 + pathLevel * 0.05;
	}
	return Math.floor(base * (1 + raidLevel / 250) * teamSizeScale[teamSize] * pathMultiplier);
}

function estimatePoints(raidLevel: number, teamSize: number) {
	const pointsTable = [
		{ name: 'Akkha', hp: scaleHP(480, raidLevel, teamSize, averageWTPLevel[3]), mult: 1.0 },
		{
			name: "Akkha's Shadow",
			hp: scaleHP(70, raidLevel, teamSize, averageWTPLevel[3]),
			mult: 1.0,
			count: 4
		},
		{ name: 'Baboons', hp: scaleHP(300, raidLevel, teamSize, 0), mult: 1.2, approx: true },
		{ name: 'Ba-Ba', hp: scaleHP(380, raidLevel, teamSize, averageWTPLevel[0]), mult: 2.0 },
		{ name: 'Zebak', hp: scaleHP(580, raidLevel, teamSize, averageWTPLevel[2]), mult: 1.5 },
		{ name: 'Scarab Swarms', hp: 200, mult: 1.0, approx: true },
		{ name: 'Scarabs', hp: 200, mult: 0.5, approx: true },
		{
			name: "Kephri's Shield",
			hp: scaleHP(375, raidLevel, teamSize, averageWTPLevel[1]),
			mult: 1.0,
			approx: true
		},
		{ name: 'Kephri', hp: scaleHP(130, raidLevel, teamSize, averageWTPLevel[1]), mult: 1.0 },
		{ name: 'P1 Obelisk', hp: scaleHP(260, raidLevel, teamSize, 0), mult: 1.5 },
		{ name: 'P2 Warden', hp: scaleHP(140, raidLevel, teamSize, 0), mult: 2.0, count: 2 },
		{ name: 'P3 Warden', hp: scaleHP(880, raidLevel, teamSize, 0), mult: 2.5 },
		{ name: 'Misc. damage', hp: 80 * teamSize, mult: 1.0, approx: true },
		{ name: 'Het - seal mining', hp: 130 + Math.floor(95.81 * (teamSize - 1)), mult: 2.5 },
		{ name: 'Scabaras - puzzles', points: 300 * teamSize, approx: true },
		{ name: 'Apmeken - traps', points: 450 * teamSize, approx: true },
		{ name: 'Crondis - palm watering', points: 400 * teamSize },
		{ name: 'MVP', points: 2700 * teamSize }
	];
	let totalPoints = 0;
	for (const value of Object.values(pointsTable)) {
		if (value.points) {
			totalPoints += value.points;
		} else {
			totalPoints += Math.floor(value.hp! * value.mult! * (value.count ?? 1));
		}
	}
	return totalPoints;
}

export const maxMageGear = constructGearSetup({
	head: 'Ancestral hat',
	neck: 'Occult necklace',
	body: 'Ancestral robe top',
	cape: 'Imbued saradomin cape',
	hands: 'Tormented bracelet',
	legs: 'Ancestral robe bottom',
	feet: 'Eternal boots',
	'2h': "Tumeken's shadow",
	ring: 'Lightbearer'
});
const maxMage = new Gear(maxMageGear);

export const maxRangeGear = constructGearSetup({
	head: 'Masori mask (f)',
	neck: 'Necklace of anguish',
	body: 'Masori body (f)',
	cape: "Ava's assembler",
	hands: 'Zaryte vambraces',
	legs: 'Masori chaps (f)',
	feet: 'Pegasian boots',
	'2h': 'Twisted bow',
	ring: 'Lightbearer',
	ammo: 'Dragon arrow'
});

const maxRange = new Gear(maxRangeGear);
maxRange.ammo!.quantity = 100_000;

export const maxMeleeLessThan300Gear = constructGearSetup({
	head: 'Torva full helm',
	neck: 'Amulet of torture',
	body: 'Torva platebody',
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: 'Torva platelegs',
	feet: 'Primordial boots',
	weapon: 'Ghrazi rapier',
	shield: 'Avernic defender',
	ring: 'Lightbearer'
});
export const maxMeleeOver300Gear = constructGearSetup({
	head: 'Torva full helm',
	neck: 'Amulet of torture',
	body: 'Torva platebody',
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: 'Torva platelegs',
	feet: 'Primordial boots',
	weapon: "Osmumten's fang",
	shield: 'Avernic defender',
	ring: 'Berserker ring(i)'
});

const SERP_HELM_CHARGES_PER_HOUR = 600;
function calcSerpHelmCharges(time: number) {
	return Math.floor(time / (Time.Hour / SERP_HELM_CHARGES_PER_HOUR));
}
const REQUIRED_ARROWS = resolveItems(['Dragon arrow', 'Amethyst arrow', 'Rune arrow', 'Adamant arrow']);

const minTOAStats: Skills = {
	attack: 90,
	strength: 90,
	defence: 90,
	magic: 90,
	prayer: 90,
	ranged: 90
};
const minimumSuppliesNeeded = new Bank({
	'Saradomin brew(4)': 10,
	'Super restore(4)': 5,
	'Ranging potion(4)': 1,
	'Super combat potion(4)': 1
});

const miscBoosts = [
	['Lightbearer', 5, null],
	["Tumeken's shadow", 25, 'mage'],
	['Bandos godsword', 2, null],
	['Twisted bow', 4, 'range']
] as const;
const primarySpecWeaponBoosts = [
	['Zaryte crossbow', 9],
	['Dragon claws', 6]
] as const;

const REQUIRED_RANGE_WEAPONS = resolveItems(['Twisted bow', 'Bow of faerdhinen (c)']);
const MELEE_REQUIRED_WEAPONS = resolveItems(['Zamorakian hasta', 'Ghrazi rapier', "Osmumten's fang"]);
const MELEE_REQUIRED_ARMOR = resolveItems(['Fire cape', 'Infernal cape']);
const BP_DARTS_NEEDED = 150;
const BP_SCALES_NEEDED = 1000;
const BOW_ARROWS_NEEDED = 150;
const ALLOWED_DARTS = ['Adamant dart', 'Rune dart', 'Amethyst dart', 'Dragon dart'].map(getOSItem);
const BLOOD_FURY_CHARGES_PER_RAID = 150;
const TUMEKEN_SHADOW_PER_RAID = 150;
const toaRequirements: {
	name: string;
	doesMeet: (options: { user: MUser; gearStats: GearSetupPercents }) => string | true;
	desc: () => string;
}[] = [
	{
		name: 'Blowpipe',
		doesMeet: ({ user }) => {
			const blowpipeData = user.blowpipe;
			const cmdMention = mentionCommand('minion', 'blowpipe');
			if (!user.owns('Toxic blowpipe')) {
				return 'Needs Toxic blowpipe (with darts and scales equipped) in bank';
			}

			if (!blowpipeData.dartID || !blowpipeData.dartQuantity || blowpipeData.dartQuantity < BP_DARTS_NEEDED) {
				return `Needs ${BP_DARTS_NEEDED}x darts equipped in your blowpipe: ${cmdMention}`;
			}
			if (!blowpipeData.scales || blowpipeData.scales < BP_SCALES_NEEDED) {
				return `Needs ${BP_SCALES_NEEDED}x scales loaded in your blowpipe: ${cmdMention}`;
			}
			if (ALLOWED_DARTS.every(item => item.id !== blowpipeData.dartID)) {
				return `Darts are too weak: ${cmdMention}`;
			}
			return true;
		},
		desc: () =>
			`atleast ${BP_DARTS_NEEDED}x darts and ${BP_SCALES_NEEDED} scales, and using one of: ${ALLOWED_DARTS.map(
				i => i.name
			).join(', ')}, loaded in Blowpipe`
	},
	{
		name: 'Range gear',
		doesMeet: ({ user, gearStats }) => {
			if (gearStats.range < 25) {
				return 'Terrible range gear';
			}

			if (!user.gear.range.hasEquipped(REQUIRED_RANGE_WEAPONS, false)) {
				return `Must have one of these equipped: ${REQUIRED_RANGE_WEAPONS.map(itemNameFromID).join(', ')}`;
			}

			const rangeAmmo = user.gear.range.ammo;
			const rangeWeapon = user.gear.range.equippedWeapon();
			if (rangeWeapon?.id !== itemID('Bow of faerdhinen (c)')) {
				if (!rangeAmmo || rangeAmmo.quantity < BOW_ARROWS_NEEDED) {
					return `Need ${BOW_ARROWS_NEEDED} arrows equipped`;
				}

				if (!REQUIRED_ARROWS.includes(rangeAmmo.item)) {
					return `Need one of these arrows equipped: ${REQUIRED_ARROWS.map(itemNameFromID).join(', ')}`;
				}
			}

			return true;
		},
		desc: () =>
			`decent range gear (BiS is ${maxRangeGear.toString()}), atleast ${BOW_ARROWS_NEEDED}x arrows equipped, and one of these bows: ${REQUIRED_RANGE_WEAPONS.map(
				itemNameFromID
			).join(', ')}`
	},
	{
		name: 'Melee gear',
		doesMeet: ({ user, gearStats }) => {
			if (gearStats.melee < 25) {
				return 'Terrible melee gear';
			}

			if (!user.gear.melee.hasEquipped(MELEE_REQUIRED_WEAPONS, false)) {
				return `Need one of these weapons in your melee setup: ${MELEE_REQUIRED_WEAPONS.map(
					itemNameFromID
				).join(', ')}`;
			}
			if (!user.gear.melee.hasEquipped(MELEE_REQUIRED_ARMOR, false)) {
				return `Need one of these in your melee setup: ${MELEE_REQUIRED_ARMOR.map(itemNameFromID).join(', ')}`;
			}

			return true;
		},
		desc: () =>
			`decent melee gear (BiS is ${maxMeleeLessThan300Gear.toString()}, switched to a Osmumten fang if the raid level is over 300), and one of these weapons: ${MELEE_REQUIRED_WEAPONS.map(
				itemNameFromID
			).join(', ')}, and one of these armor pieces: ${MELEE_REQUIRED_ARMOR.map(itemNameFromID).join(', ')}`
	},
	{
		name: 'Mage gear',
		doesMeet: ({ gearStats }) => {
			if (gearStats.mage < 25) {
				return 'Terrible mage gear';
			}

			return true;
		},
		desc: () => `decent mage gear (BiS is ${maxMageGear.toString()})`
	},
	{
		name: 'Stats',
		doesMeet: ({ user }) => {
			if (!user.hasSkillReqs(minTOAStats)) {
				return `You need: ${formatSkillRequirements(minTOAStats)}.`;
			}
			return true;
		},
		desc: () => `${formatSkillRequirements(minTOAStats)}`
	},
	{
		name: 'Supplies',
		doesMeet: ({ user }) => {
			if (!user.owns(minimumSuppliesNeeded)) {
				return `You need atleast this much supplies: ${minimumSuppliesNeeded}.`;
			}
			if (
				user.gear.melee.hasEquipped('Amulet of blood fury') &&
				user.user.blood_fury_charges < BLOOD_FURY_CHARGES_PER_RAID
			) {
				return `You need atleast ${BLOOD_FURY_CHARGES_PER_RAID} Blood fury charges to use it, otherwise it has to be unequipped: ${mentionCommand(
					'minion',
					'charge'
				)}`;
			}

			if (
				user.gear.mage.hasEquipped("Tumeken's shadow") &&
				user.user.tum_shadow_charges < TUMEKEN_SHADOW_PER_RAID
			) {
				return `You need atleast ${TUMEKEN_SHADOW_PER_RAID} Tumeken's shadow charges to use it, otherwise it has to be unequipped: ${mentionCommand(
					'minion',
					'charge'
				)}`;
			}

			return true;
		},
		desc: () => `Need atleast ${minimumSuppliesNeeded}`
	},
	{
		name: 'Rune Pouch',
		doesMeet: ({ user }) => {
			const similarItems = getSimilarItems(itemID('Rune pouch'));
			if (similarItems.every(item => !user.owns(item))) {
				return 'You need to own a Rune pouch.';
			}
			return true;
		},
		desc: () => `Need atleast ${minimumSuppliesNeeded}`
	},
	{
		name: 'Poison Protection',
		doesMeet: ({ user }) => {
			const ownsSanfew = user.owns('Sanfew serum(4)');
			const hasSerpHelm = user.gear.melee.hasEquipped('Serpentine helm', false);
			const hasSerpHelmCharges = user.user.serp_helm_charges >= calcSerpHelmCharges(Time.Hour);
			const canUseSerp = hasSerpHelm && hasSerpHelmCharges;

			if (!ownsSanfew && !canUseSerp) {
				return 'You need a charged Serpentine helmet equipped in melee, or a Sanfew serum(4) in your bank.';
			}
			return true;
		},
		desc: () => 'Need a charged Serpentine helmet equipped in melee, or a Sanfew serum(4) in your bank'
	}
];

export function calculateXPFromRaid({
	realDuration,
	fakeDuration,
	user,
	raidLevel,
	teamSize,
	points
}: {
	raidLevel: number;
	realDuration: number;
	fakeDuration: number;
	user: MUser;
	teamSize: number;
	points: number;
}) {
	const percentOfRaid = calcWhatPercent(realDuration, fakeDuration);
	let totalMeleeXPPerRaid = 10_000 + increaseNumByPercent(10_000, calcWhatPercent(raidLevel, 600));

	const possiblePoints = estimatePoints(raidLevel, teamSize) / teamSize;
	const percentOfPossiblePoints = calcWhatPercent(points, possiblePoints);

	totalMeleeXPPerRaid = calcPercentOfNum(percentOfPossiblePoints, totalMeleeXPPerRaid);

	let meleeStyles = user.getAttackStyles();
	const isTrainingMelee = meleeStyles.some(style =>
		[SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence].includes(style)
	);
	if (!isTrainingMelee) meleeStyles = [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
	const xpPerStyle = Math.floor(totalMeleeXPPerRaid / meleeStyles.length);
	const promises: Promise<string>[] = [];

	let totalCombatXP = 0;

	for (const style of meleeStyles) {
		let amount = calcPercentOfNum(percentOfRaid, xpPerStyle);
		totalCombatXP += amount;
		promises.push(
			user.addXP({
				skillName: style,
				amount,
				duration: realDuration,
				source: XpGainSource.TombsOfAmascut,
				minimal: true
			})
		);
	}

	const mageXP = calcPercentOfNum(percentOfRaid, totalMeleeXPPerRaid * 1.35);
	totalCombatXP += mageXP;

	promises.push(
		user.addXP({
			skillName: SkillsEnum.Magic,
			amount: mageXP,
			duration: realDuration,
			source: XpGainSource.TombsOfAmascut,
			minimal: true
		})
	);

	totalCombatXP += mageXP;
	promises.push(
		user.addXP({
			skillName: SkillsEnum.Ranged,
			amount: mageXP,
			duration: realDuration,
			source: XpGainSource.TombsOfAmascut,
			minimal: true
		})
	);

	promises.push(
		user.addXP({
			skillName: SkillsEnum.Hitpoints,
			amount: Math.floor(totalCombatXP / 4),
			duration: realDuration,
			minimal: true,
			source: XpGainSource.TombsOfAmascut
		})
	);
	return promises;
}

interface BaseTOAUser {
	id: string;
}

interface TOAInputUser extends BaseTOAUser {
	gear: UserFullGearSetup;
	skills: Required<Skills>;
	totalKC: number;
	totalAttempts: number;
}

interface TOAParsedUser extends TOAInputUser {
	gearStats: GearSetupPercents;
	points: number;
	deaths: number[];
	user: MUser;
	totalEffectiveness: number;
}

const untradeables = [
	{
		item: getOSItem('Thread of elidinis'),
		dropRate: 10
	},
	{
		item: getOSItem('Eye of the corruptor'),
		dropRate: 60
	},
	{
		item: getOSItem('Jewel of the sun'),
		dropRate: 60
	},
	{
		item: getOSItem('Breach of the scarab'),
		dropRate: 60
	}
];

function untradeableRoll(kc: number, cl: Bank) {
	let loot = new Bank();
	for (const { item, dropRate } of untradeables) {
		let rolls = 1;
		if (!cl.has(item.id) && kc > 5) {
			rolls = Math.min(3, Math.floor(kc / 5));
		}
		for (let i = 0; i < rolls; i++) {
			if (roll(dropRate)) {
				loot.add(item.id);
				break;
			}
		}
	}
	return loot;
}

let TOAUniqueTable = new LootTable()
	.add('Lightbearer', 1, 7)
	.add("Osmumten's fang", 1, 7)
	.add("Elidinis' ward", 1, 3)
	.add('Masori mask', 1, 2)
	.add('Masori body', 1, 2)
	.add('Masori chaps', 1, 2)
	.add("Tumeken's shadow (uncharged)", 1, 1);

function uniqueLootRoll(kc: number, cl: Bank, raidLevel: RaidLevel) {
	const [item] = TOAUniqueTable.roll().items()[0];

	if (resolveItems(["Osmumten's fang", 'Lightbearer']).includes(item.id) && raidLevel < 50 && !roll(50)) {
		return untradeableRoll(kc, cl);
	}

	if (
		resolveItems([
			"Elidinis' ward",
			'Masori mask',
			'Masori body',
			'Masori chaps',
			"Tumeken's shadow (uncharged)"
		]).includes(item.id) &&
		raidLevel < 150 &&
		!roll(50)
	) {
		return untradeableRoll(kc, cl);
	}

	return new Bank().add(item.id);
}

const nonUniqueTable = [
	['Coins', 1],
	['Death rune', 20],
	['Soul rune', 40],
	['Gold ore', 90],
	['Dragon dart tip', 100],
	['Mahogany logs', 180],
	['Sapphire', 200],
	['Emerald', 250],
	['Gold bar', 250],
	['Potato cactus', 250],
	['Raw shark', 250],
	['Ruby', 300],
	['Diamond', 400],
	['Raw manta ray', 450],
	['Cactus spine', 600],
	['Dragonstone', 600],
	['Battlestaff', 1100],
	['Coconut milk', 1100],
	['Lily of the sands', 1100],
	['Toadflax seed', 1400],
	['Ranarr seed', 1800],
	['Torstol seed', 2200],
	['Snapdragon seed', 2200],
	['Dragon med helm', 4000],
	['Magic seed', 6500],
	['Blood essence', 7500],
	['Cache of runes', null]
] as const;

function nonUniqueLoot({ points }: { points: number }) {
	assert(points >= 1 && points <= 64_000, `Points (${points.toLocaleString()}) must be between 1-64,000`);
	let loot = new Bank();

	for (let i = 0; i < 3; i++) {
		const [item, divisor] = randArrItem(nonUniqueTable);
		loot.add(getOSItem(item).id, divisor === null ? 1 : Math.ceil(points / divisor));
	}

	return loot;
}

interface TOALootUser {
	id: string;
	points: number;
	cl: Bank;
	kc: number;
	deaths: number[];
}

export const toaOrnamentKits = [
	[getOSItem('Cursed phalanx'), 500],
	[getOSItem('Menaphite ornament kit'), 425],
	[getOSItem('Masori crafting kit'), 350]
] as const;

export const toaPetTransmogItems = resolveItems([
	'Remnant of zebak',
	'Ancient remnant',
	'Remnant of kephri',
	'Remnant of ba-ba',
	'Remnant of akkha'
]);

export function calcTOALoot({ users, raidLevel }: { users: TOALootUser[]; raidLevel: RaidLevel }) {
	const uniqueDeciderTable = new SimpleTable();
	for (const user of users) uniqueDeciderTable.add(user.id, user.points);
	const loot = new TeamLoot();
	const totalTeamPoints = sumArr(users.map(i => i.points));

	// The number of raid levels less than or equal to 400
	let x = Math.min(raidLevel, 400);
	// The number of raid levels from 400 to 550
	let y = Math.min(150, raidLevel - 400);

	// prettier-ignore
	let pointsForOnePercentUniqueChance = 10_500 - 20 * (x + (y / 3));
	let chanceOfUnique = Math.min(totalTeamPoints / pointsForOnePercentUniqueChance, 55);
	let didGetUnique = percentChance(chanceOfUnique);
	const uniqueRecipient = didGetUnique ? uniqueDeciderTable.roll() : null;

	const messages: string[] = [
		`${users.length === 1 ? 'You' : 'Your team'} had a ${chanceOfUnique.toFixed(
			2
		)}% chance of getting a unique drop.`
	];

	for (const user of users) {
		if (user.points < 1500) {
			loot.add(user.id, 'Fossilised dung');
			continue;
		}
		if (uniqueRecipient && user.id === uniqueRecipient) {
			loot.add(user.id, uniqueLootRoll(user.kc, user.cl, raidLevel));
		} else {
			loot.add(user.id, nonUniqueLoot({ points: user.points }));
		}
		loot.add(user.id, untradeableRoll(user.kc, user.cl));

		let pointsForOnePercentPetChance = 350_000 - 700 * (x + y / 3);
		let chanceOfPet = Math.min(user.points / pointsForOnePercentPetChance, 55);
		let didGetPet = percentChance(chanceOfPet);
		if (didGetPet) {
			loot.add(user.id, "Tumeken's guardian");
		}

		const eliteClueChance = (user.points / 200_000 / users.length) * 100;
		if (percentChance(eliteClueChance)) {
			loot.add(user.id, 'Clue scroll (elite)');
		}
	}

	const specialItemsReceived: number[] = [];
	const hadNoDeaths = users.every(u => u.deaths.length === 0);
	if (hadNoDeaths) {
		for (const kit of toaOrnamentKits.filter(i => raidLevel >= i[1])) {
			specialItemsReceived.push(kit[0].id);
			break;
		}
		if (raidLevel >= 450 && roll(3)) {
			specialItemsReceived.push(randArrItem(toaPetTransmogItems));
		}
		if (specialItemsReceived.length > 0) {
			for (const user of users) {
				for (const kit of specialItemsReceived) {
					loot.add(user.id, kit);
				}
			}
			messages.push(
				`You all received a ${specialItemsReceived
					.map(itemNameFromID)
					.join(', ')} for completing the raid without any deaths!`
			);
		}
	}

	return {
		teamLoot: loot,
		messages
	};
}

const TOARooms = [
	{
		id: 1,
		name: 'Akkha',
		difficulty: 1,
		timeWeighting: 1
	},
	{
		id: 2,
		name: 'Ba-Ba',
		difficulty: 1,
		timeWeighting: 1
	},
	{
		id: 3,
		name: 'Kephri',
		difficulty: 1,
		timeWeighting: 1
	},
	{
		id: 4,
		name: 'Zebak',
		difficulty: 1,
		timeWeighting: 1
	},
	{
		id: 5,
		name: 'Warden',
		difficulty: 3,
		timeWeighting: 2
	}
] as const;

export const mileStoneBaseDeathChances = [
	{ level: 600, chance: 97, minChance: 97 },
	{ level: 500, chance: 85, minChance: 93 },
	{ level: 450, chance: 48.5, minChance: null },
	{ level: 400, chance: 36, minChance: null },
	{ level: 350, chance: 25.5, minChance: null },
	{ level: 300, chance: 23, minChance: null },
	{ level: 200, chance: 15, minChance: null },
	{ level: 150, chance: 13, minChance: null },
	{ level: 100, chance: 10, minChance: null },
	{ level: 1, chance: 5, minChance: null }
] as const;

export type RaidLevel = typeof mileStoneBaseDeathChances[number]['level'];

function calcDeathChance(totalAttempts: number, raidLevel: RaidLevel, tobAndCoxKC: number) {
	const obj = mileStoneBaseDeathChances.find(i => i.level === raidLevel)!;

	let deathChance: number = obj.chance;
	const { minChance } = obj;

	const map = [
		{
			attemptsMax: 1,
			increase: 250
		},
		{
			attemptsMax: 5,
			increase: 125
		},
		{
			attemptsMax: 10,
			increase: 100
		},
		{
			attemptsMax: 20,
			increase: 25
		},
		{
			attemptsMax: 30,
			increase: 15
		},
		{
			attemptsMax: 50,
			increase: 5
		},
		{
			attemptsMax: 100,
			increase: 1
		}
	] as const;

	const tobCoxKCDivided = Math.floor(tobAndCoxKC / 250);
	if (tobAndCoxKC > 0) {
		totalAttempts += clamp(tobCoxKCDivided, 0, 2);
	}

	const match = map.find(i => totalAttempts <= i.attemptsMax)! ?? map[map.length - 1];
	const nextMatch = map[map.indexOf(match) + 1] ?? { attemptsMax: Infinity, increase: 0 };

	const increase = scaleNumber(
		totalAttempts,
		match.attemptsMax,
		nextMatch.attemptsMax,
		match.increase,
		nextMatch.increase
	);
	deathChance = increaseNumByPercent(deathChance, increase);

	if (totalAttempts > 100) {
		deathChance = reduceNumByPercent(deathChance, scaleNumber(totalAttempts, 100, 250, 0, 50));
	}
	if (minChance) {
		deathChance = clamp(deathChance, minChance, 99);
	}
	deathChance = clamp(deathChance, 5, 99);

	deathChance = Math.round(randomVariation(deathChance, 0.5));

	return deathChance;
}

function calculateTotalEffectiveness({
	totalAttempts,
	totalKC,
	gearStats,
	skillsAsLevels,
	randomNess
}: {
	totalKC: number;
	totalAttempts: number;
	gearStats: GearSetupPercents;
	skillsAsLevels: Skills;
	randomNess: boolean;
}) {
	let percents = [];

	percents.push(clamp(calcWhatPercent(totalKC, 20), 0, 100));
	percents.push(clamp(calcWhatPercent(totalAttempts, 20), 0, 100));
	const skillsThatMatter = [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Magic, SkillsEnum.Ranged];
	const totalSkills = objectEntries(skillsAsLevels)
		.filter(i => skillsThatMatter.includes(i[0]))
		.reduce((prev, curr) => prev + curr[1]!, 0);
	percents.push(calcWhatPercent(totalSkills, skillsThatMatter.length * 99));
	percents.push(gearStats.total);

	if (randomNess) {
		percents.push(randInt(50, 100));
	}

	return exponentialPercentScale(sumArr(percents) / percents.length);
}

function calculatePointsAndDeaths(
	effectiveness: number,
	totalAttempts: number,
	raidLevel: RaidLevel,
	coxAndTobKC: number,
	teamSize: number
) {
	let deaths: number[] = [];
	let deathChance = calcDeathChance(totalAttempts, raidLevel, coxAndTobKC);
	const harshEffectivenessScale = exponentialPercentScale(effectiveness, 0.05);

	let points = estimatePoints(raidLevel, teamSize) / teamSize;

	const minDeathChance = mileStoneBaseDeathChances.find(i => i.level === raidLevel)!.minChance;
	for (const room of TOARooms) {
		let roomDeathChance = deathChance / TOARooms.length;
		if (minDeathChance) roomDeathChance += minDeathChance / 3;
		if (percentChance(roomDeathChance) || (totalAttempts < 30 && raidLevel >= 500)) {
			deaths.push(room.id);
			points = reduceNumByPercent(points, 20);
		}
	}

	const tenPercent = calcPercentOfNum(10, points);
	points -= tenPercent;
	points += calcPercentOfNum(harshEffectivenessScale, tenPercent);

	points = Math.floor(points);
	points = clamp(points, 1, 64_000);

	return {
		points,
		deaths
	};
}

function calcSetupPercent(
	maxStats: GearStats,
	userStats: GearStats,
	heavyPenalizeStat: keyof GearStats,
	ignoreStats: (keyof GearStats)[],
	melee: boolean
) {
	let numKeys = 0;
	let totalPercent = 0;
	for (const [key, val] of Object.entries(maxStats) as [keyof GearStats, number][]) {
		if (val <= 0 || ignoreStats.includes(key)) continue;
		const rawPercent = Math.min(100, calcWhatPercent(userStats[key], val));
		totalPercent += rawPercent;
		numKeys++;
	}
	// For melee compare the highest melee attack stat of max setup with the highest melee attack stat of the user
	if (melee) {
		let maxMeleeStat = Math.max(
			maxStats['attack_stab'],
			Math.max(maxStats['attack_slash'], maxStats['attack_crush'])
		);
		let userMeleeStat = Math.max(
			userStats['attack_stab'],
			Math.max(userStats['attack_slash'], userStats['attack_crush'])
		);
		totalPercent += Math.min(100, calcWhatPercent(userMeleeStat, maxMeleeStat));
		numKeys++;
	}
	totalPercent /= numKeys;
	// Heavy penalize for having less than 50% in the main stat of this setup.
	if (userStats[heavyPenalizeStat] < maxStats[heavyPenalizeStat] / 2) {
		totalPercent = Math.floor(Math.max(0, totalPercent / 2));
	}
	return totalPercent;
}

interface GearSetupPercents {
	melee: number;
	range: number;
	mage: number;
	total: number;
}
export function calculateUserGearPercents(gear: UserFullGearSetup, raidLevel: number): GearSetupPercents {
	const maxMelee = raidLevel < 300 ? maxMeleeLessThan300Gear : maxMeleeOver300Gear;
	const melee = calcSetupPercent(
		maxMelee.stats,
		gear.melee.stats,
		'melee_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_ranged', 'attack_magic'],
		true
	);
	const range = calcSetupPercent(
		maxRange.stats,
		gear.range.stats,
		'ranged_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_magic'],
		false
	);
	const mage = calcSetupPercent(
		maxMage.stats,
		gear.mage.stats,
		'magic_damage',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_ranged'],
		false
	);
	return {
		melee,
		range,
		mage,
		total: (melee + range + mage) / 3
	};
}

async function calcTOAInput({
	user,
	kcOverride,
	duration
}: {
	user: MUser;
	kcOverride?: number;
	duration: number;
}): Promise<{
	cost: Bank;
	serpHelmCharges: number;
	blowpipeCost: Bank;
}> {
	const cost = new Bank();
	const kc = kcOverride ?? (await getMinigameScore(user.id, 'tombs_of_amascut'));
	cost.add('Super combat potion(4)', 1);
	cost.add('Ranging potion(4)', 1);

	let serpHelmCharges = 0;

	if (!user.gear.melee.hasEquipped('Serpentine helm')) {
		cost.add('Sanfew serum(4)', 1);
	} else {
		serpHelmCharges = calcSerpHelmCharges(duration);
	}

	// Between 8-1 brews
	let brewsNeeded = Math.max(1, 9 - Math.max(1, Math.ceil((kc + 1) / 12)));
	let restoresNeeded = Math.max(2, Math.floor(brewsNeeded / 3));
	if (kc < 2) restoresNeeded += 3;
	else if (kc < 5) restoresNeeded += 2;

	cost.add('Saradomin brew(4)', brewsNeeded);
	cost.add('Super restore(4)', restoresNeeded);

	const rangeWeapon = user.gear.range.equippedWeapon();
	if (!rangeWeapon) {
		throw new Error(`${user.logName} had no range weapon for TOA`);
	}
	if (rangeWeapon.id !== itemID('Bow of faerdhinen (c)')) {
		cost.add(user.gear.range.ammo!.item, BOW_ARROWS_NEEDED);
	}
	if (user.gear.melee.hasEquipped('Amulet of blood fury')) {
		cost.remove('Saradomin brew(4)');
	}

	const { blowpipe } = user;
	const dartID = blowpipe.dartID ?? itemID('Rune dart');
	const dartQuantity = blowpipe.dartQuantity ?? BP_DARTS_NEEDED;
	const blowpipeCost = new Bank();
	blowpipeCost.add(dartID, Math.floor(Math.min(dartQuantity, BP_DARTS_NEEDED)));

	return {
		cost,
		serpHelmCharges,
		blowpipeCost
	};
}

export async function checkTOAUser(
	user: MUser,
	kc: number,
	raidLevel: number,
	teamSize: number,
	duration: number
): Promise<[false] | [true, string]> {
	if (!user.hasMinion) {
		return [true, `${user.usernameOrMention} doesn't have a minion`];
	}

	const setupPercents = calculateUserGearPercents(user.gear, raidLevel);
	const reqResults = toaRequirements.map(i => ({ ...i, result: i.doesMeet({ user, gearStats: setupPercents }) }));
	const unmetReqs = reqResults.filter(i => typeof i.result === 'string');
	if (unmetReqs.length > 0) {
		return [
			true,
			`${user.usernameOrMention} doesn't meet the requirements: ${unmetReqs.map(i => i.result).join(', ')}`
		];
	}

	const { cost, serpHelmCharges } = await calcTOAInput({ user, duration });
	if (!user.owns(cost, { includeGear: true })) {
		return [true, `${user.usernameOrMention} doesn't own the required supplies: ${cost.remove(user.bankWithGP)}`];
	}

	if (user.user.serp_helm_charges < serpHelmCharges) {
		return [
			true,
			`${
				user.usernameOrMention
			} doesn't have enough Serpentine helm charges. You need atleast ${serpHelmCharges} charges to do a ${formatDuration(
				duration
			)} TOA raid.`
		];
	}

	if (teamSize < 3 && raidLevel > 200) {
		let dividedRaidLevel = raidLevel / 10;
		if (teamSize === 2) dividedRaidLevel /= 2;
		dividedRaidLevel = Math.floor(dividedRaidLevel);
		if (kc < dividedRaidLevel) {
			return [
				true,
				`${user.usernameOrMention}, you need atleast ${dividedRaidLevel} TOA KC to ${
					teamSize === 2 ? 'duo' : 'solo'
				} a level ${raidLevel} TOA raid.`
			];
		}
	}

	return [false];
}

export async function checkTOATeam(users: MUser[], raidLevel: number): Promise<string | null> {
	const userWithoutSupplies = users.find(u => !u.bank.has(minimumSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.usernameOrMention} doesn't have enough supplies`;
	}
	if (users.length < 1 || users.length > 8) {
		return 'TOA team must be 1-8 users';
	}

	for (const user of users) {
		if (user.minionIsBusy) return `${user.usernameOrMention}'s minion is busy.`;
		const checkResult = await checkTOAUser(
			user,
			await getMinigameScore(user.id, 'tombs_of_amascut'),
			raidLevel,
			users.length,
			Time.Hour
		);
		if (!checkResult[0]) {
			continue;
		} else {
			return checkResult[1];
		}
	}

	return null;
}

export async function toaStartCommand(
	user: MUser,
	solo: boolean,
	channelID: string,
	raidLevel: RaidLevel,
	teamSize?: number
): CommandResponse {
	if (user.minionIsBusy) {
		return `${user.usernameOrMention} minion is busy`;
	}

	const initialCheck = await checkTOAUser(
		user,
		await getMinigameScore(user.id, 'tombs_of_amascut'),
		raidLevel,
		solo ? 1 : teamSize ?? 5,
		Time.Hour
	);
	if (initialCheck[0]) {
		return initialCheck[1];
	}

	if (user.minionIsBusy) {
		return "Your minion is busy, so you can't start a raid.";
	}

	let maxSize = mahojiParseNumber({ input: teamSize, min: 2, max: 8 }) ?? 8;

	const partyOptions: MakePartyOptions = {
		leader: user,
		minSize: 1,
		maxSize,
		ironmanAllowed: true,
		message: `${user.usernameOrMention} is hosting a Tombs of Amascut mass! Use the buttons below to join/leave.`,
		customDenier: async user => {
			if (user.minionIsBusy) {
				return [true, `${user.usernameOrMention} minion is busy`];
			}

			return checkTOAUser(user, 0, 200, 5, Time.Hour);
		}
	};

	const channel = globalClient.channels.cache.get(channelID);
	if (!channelIsSendable(channel)) return 'No channel found.';
	let usersWhoConfirmed = [];
	try {
		usersWhoConfirmed = solo ? [user] : await setupParty(channel, user, partyOptions);
	} catch (err: any) {
		return {
			content: typeof err === 'string' ? err : 'Your mass failed to start.',
			ephemeral: true
		};
	}
	const users = usersWhoConfirmed.filter(u => !u.minionIsBusy).slice(0, maxSize);

	const teamCheckFailure = await checkTOATeam(users, raidLevel);
	if (teamCheckFailure) {
		return {
			content: `Your mass failed to start because of this reason: ${teamCheckFailure} ${users}`,
			allowedMentions: {
				users: users.map(i => i.id)
			}
		};
	}

	const {
		duration,
		totalReduction,
		reductions,
		wipedRoom: _wipedRoom,
		deathDuration,
		parsedTeam,
		messages
	} = await createTOATeam({
		team: users,
		raidLevel
	});
	const wipedRoom = _wipedRoom ? TOARooms.find(room => _wipedRoom === room.id)! : null;
	let debugStr = '';

	const totalCost = new Bank();

	const costResult = await Promise.all(
		users.map(async u => {
			const { cost, blowpipeCost } = await calcTOAInput({ user: u, duration });
			const { realCost } = await u.specialRemoveItems(cost.clone().add(blowpipeCost));
			if (u.gear.melee.hasEquipped('Serpentine helm')) {
				await degradeItem({
					item: getOSItem('Serpentine helm'),
					chargesToDegrade: calcSerpHelmCharges(duration),
					user: u
				});
			}
			if (u.gear.melee.hasEquipped('Amulet of blood fury')) {
				await degradeItem({
					item: getOSItem('Amulet of blood fury'),
					chargesToDegrade: BLOOD_FURY_CHARGES_PER_RAID,
					user: u
				});
			}
			if (u.gear.mage.hasEquipped("Tumeken's shadow")) {
				await degradeItem({
					item: getOSItem("Tumeken's shadow"),
					chargesToDegrade: TUMEKEN_SHADOW_PER_RAID,
					user: u
				});
			}
			await userStatsBankUpdate(u.id, 'toa_cost', realCost);
			const effectiveCost = realCost.clone();
			totalCost.add(effectiveCost);

			const { total } = calculateUserGearPercents(u.gear, raidLevel);
			debugStr += `**- ${u.usernameOrMention}** (${Emoji.Gear}${total.toFixed(1)}% ${
				Emoji.CombatSword
			} ${calcWhatPercent(reductions[u.id], totalReduction).toFixed(1)}%) used ${realCost}\n\n`;
			return {
				userID: u.id,
				effectiveCost
			};
		})
	);

	updateBankSetting('toa_cost', totalCost);
	await trackLoot({
		totalCost,
		id: 'tombs_of_amascut',
		type: 'Minigame',
		changeType: 'cost',
		users: costResult.map(i => ({
			id: i.userID,
			cost: i.effectiveCost,
			duration
		}))
	});

	let userArr: TOAOptions['detailedUsers'] = [];
	for (const user of parsedTeam) {
		userArr.push([user.id, [user.points], [user.deaths]]);
	}

	await addSubTaskToActivityTask<TOAOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: deathDuration ?? duration,
		type: 'TombsOfAmascut',
		leader: user.id,
		users: users.map(i => i.id),
		detailedUsers: userArr,
		wipedRoom: wipedRoom === null ? null : wipedRoom.id,
		fakeDuration: duration,
		raidLevel,
		quantity: 1
	});

	let str = `${partyOptions.leader.usernameOrMention}'s party (${users
		.map(u => u.usernameOrMention)
		.join(
			', '
		)}) is now off to do a level ${raidLevel} Tombs of Amascut raid - the total trip will take ${formatDuration(
		duration
	)}.`;

	str += ` \n\n${debugStr}`;

	if (messages.length > 0) {
		str += `\n**Message:** ${messages.join(',')}`;
	}

	return str;
}

const speedReductionForGear = 15;
const speedReductionForKC = 38;
const totalSpeedReductions =
	speedReductionForGear +
	speedReductionForKC +
	primarySpecWeaponBoosts[0][1] +
	sumArr(miscBoosts.map(i => i[1])) +
	15; // Os fang;

let baseTOADurations: Record<RaidLevel, number> = {
	1: Time.Minute * 50,
	100: Time.Minute * 50,
	150: Time.Minute * 60,
	200: Time.Minute * 65,
	300: Time.Minute * 70,
	350: Time.Minute * 75,
	400: Time.Minute * 80,
	450: Time.Minute * 85,
	500: Time.Minute * 90,
	600: Time.Minute * 100
};

const { ceil } = Math;
function calcPerc(perc: number, num: number) {
	return ceil(calcPercentOfNum(ceil(perc), num));
}

interface ParsedTeamMember {
	id: string;
	kc: number;
	deaths: number[];
	points: number;
	attempts: number;
}

export async function createTOATeam({
	team,
	disableVariation,
	raidLevel
}: {
	raidLevel: RaidLevel;
	team: MUser[];
	disableVariation?: true;
}) {
	let arr: TOAParsedUser[] = [];
	const messages: string[] = [];

	for (const user of team) {
		let gearStats = calculateUserGearPercents(user.gear, raidLevel);
		const [userStats, minigameScores] = await Promise.all([user.fetchStats(), getMinigameEntity(user.id)]);
		const totalAttempts = userStats.toa_attempts;
		const totalKC = minigameScores.tombs_of_amascut;
		const effectiveness = calculateTotalEffectiveness({
			totalAttempts,
			totalKC,
			skillsAsLevels: user.skillsAsLevels,
			gearStats,
			randomNess: true
		});
		const { points, deaths } = calculatePointsAndDeaths(
			effectiveness,
			totalAttempts,
			raidLevel,
			minigameScores.raids + minigameScores.tob,
			team.length
		);
		arr.push({
			id: user.id,
			gearStats,
			points,
			deaths,
			user,
			gear: user.gear,
			totalAttempts,
			totalKC,
			skills: user.getSkills(true),
			totalEffectiveness: effectiveness
		});
	}
	const teamSize = team.length;
	const maxScaling = 350;
	assert(teamSize >= 1 && teamSize < 9, 'TOA team must be 1-8 users');

	let individualReductions: { id: string; reduction: number }[] = [];

	let reductions: Record<string, number> = {};

	let parsedTeam: ParsedTeamMember[] = [];

	for (const u of arr) {
		let userPercentChange = 0;

		// Reduce time for gear
		const gearPercents = calculateUserGearPercents(u.user.gear, raidLevel);
		const gearPercentBoost = calcPerc(gearPercents.total, speedReductionForGear);
		userPercentChange += gearPercentBoost;

		// Reduce time for KC
		const kcPercent = clamp(calcWhatPercent(u.totalAttempts, maxScaling), 1, 100);
		let kcPercentBoost = calcPerc(kcPercent, speedReductionForKC);
		userPercentChange += kcPercentBoost;

		let weaponBoosts: string[] = ["Osmumten's fang", 'Ghrazi rapier'];
		let boostAmounts = [15, 6] as const;

		// If the raid level is less than 300, Ghrazi rapier is the BIS instead.
		if (raidLevel < 300) weaponBoosts = [weaponBoosts[1], weaponBoosts[0]];
		for (let i = 0; i < weaponBoosts.length; i++) {
			let amount = boostAmounts[i];
			if (u.gear.melee.hasEquipped(weaponBoosts[i])) {
				userPercentChange += amount;
				break;
			}
		}

		for (const [name, percent] of primarySpecWeaponBoosts) {
			if (u.user.hasEquippedOrInBank(name)) {
				userPercentChange += percent;
				break;
			}
		}

		for (const [name, percent, gearSetup] of miscBoosts) {
			if (gearSetup !== null ? u.user.gear[gearSetup].hasEquipped(name) : u.user.hasEquippedOrInBank(name)) {
				userPercentChange += percent;
			}
		}

		userPercentChange = calcWhatPercent(userPercentChange, totalSpeedReductions);
		let reduction = round(userPercentChange / teamSize, 1);

		individualReductions.push({ id: u.id, reduction: userPercentChange });
		reductions[u.user.id] = reduction;

		parsedTeam.push({
			id: u.id,
			kc: u.totalKC,
			deaths: u.deaths,
			points: u.points,
			attempts: u.totalAttempts
		});
	}
	let duration = baseTOADurations[raidLevel];

	if (raidLevel > 100) {
		duration += (raidLevel / 100) * Time.Minute;
	}

	individualReductions.sort((a, b) => b.reduction - a.reduction);
	const individualReductionsNums = individualReductions.map(i => i.reduction);
	let totalReduction = sumArr(individualReductionsNums);

	// Remove the worst player from speed calculation if team size > 2:
	if (teamSize > 2) {
		const worstTeamMember = individualReductions[individualReductions.length - 1];
		totalReduction -= worstTeamMember.reduction;
		totalReduction = round(totalReduction / (teamSize - 1), 2);
		messages.push(
			`${
				arr.find(i => i.id === worstTeamMember.id)!.user.badgedUsername
			} is being carried by the rest of the team so they don't affect the raid time!`
		);
	} else {
		totalReduction = round(totalReduction / teamSize, 2);
	}

	duration = reduceNumByPercent(duration, exponentialPercentScale(totalReduction));

	if (duration < Time.Minute * 20) {
		duration = Math.max(Time.Minute * 20, duration);
	}

	if (team.length < 5) {
		duration += (5 - team.length) * (Time.Minute * 1.3);
	}

	duration = Math.floor(randomVariation(duration, 1));

	let wipedRoom: number | null = null;
	let deathDuration: number | null = 0;

	for (const room of TOARooms) {
		if (arr.every(u => u.deaths.includes(room.id))) {
			wipedRoom = room.id;
		}
	}

	for (let i = 0; i < TOARooms.length; i++) {
		let room = TOARooms[i];

		if (parsedTeam.every(member => member.deaths.includes(i))) {
			wipedRoom = room.id;
			deathDuration += Math.floor(
				calcPercentOfNum(disableVariation ? room.timeWeighting / 2 : randInt(1, room.timeWeighting), duration)
			);
			break;
		} else {
			deathDuration += Math.floor(calcPercentOfNum(room.timeWeighting, duration));
		}
	}

	if (!wipedRoom) deathDuration = null;

	if (wipedRoom !== null && !TOARooms.some(room => room.id === wipedRoom)) {
		wipedRoom = null;
	}

	return {
		duration,
		reductions,
		totalReduction: 100 / teamSize,
		parsedTeam,
		wipedRoom,
		deathDuration,
		messages
	};
}

export async function toaCheckCommand(user: MUser) {
	const result = await checkTOAUser(user, await getMinigameScore(user.id, 'tombs_of_amascut'), 200, 5, Time.Hour);
	if (result[0]) {
		return `🔴 You aren't able to join a Tombs of Amascut raid, address these issues first: ${result[1]}`;
	}

	return `✅ You are ready to do the Tombs of Amascut! Start a raid: ${mentionCommand('raid', 'toa', 'start')}`;
}

function calculateBoostString(user: MUser) {
	let str = '**Boosts**\n';
	const hasMiscBoosts = miscBoosts.map(([name, , gearSetup]) => ({
		has: gearSetup !== null ? user.gear[gearSetup].hasEquipped(name) : user.hasEquippedOrInBank(name),
		item: getOSItem(name)
	}));
	const hasEveryMisc = hasMiscBoosts.every(i => i.has);
	const hasNoMisc = hasMiscBoosts.every(i => !i.has);
	str += `**Misc Boosts:** ${hasEveryMisc ? '🟢' : hasNoMisc ? '🔴' : '🟠'}`;
	if (!hasEveryMisc) {
		str += ` (Missing ${hasMiscBoosts
			.filter(i => !i.has)
			.map(i => i.item.name)
			.join(', ')})`;
	}
	str += '\n';

	const hasSpecWepBoosts = primarySpecWeaponBoosts.map(([name], index) => ({
		has: user.hasEquippedOrInBank(name),
		item: getOSItem(name),
		index
	}));

	const hasBestSpec = hasSpecWepBoosts.some(i => i.index === 0 && i.has);
	const hasNoSpec = hasSpecWepBoosts.every(i => !i.has);

	str += `**Spec Weapon Boosts:** ${hasBestSpec ? '🟢' : hasNoSpec ? '🔴' : '🟠'}`;

	if (hasNoSpec) {
		str += ` (Missing one of these: ${hasSpecWepBoosts.map(i => i.item.name).join(' OR ')})`;
	} else if (!hasBestSpec) {
		str += ` (Missing ${getOSItem(primarySpecWeaponBoosts[0][0]).name})`;
	}
	return str;
}

export async function getToaKCs(user: MUser | UserStats) {
	const userStats = user instanceof MUserClass ? await user.fetchStats() : user;
	let entryKC = 0;
	let normalKC = 0;
	let expertKC = 0;
	for (const [levelStr, qty] of Object.entries(userStats.toa_raid_levels_bank as ItemBank)) {
		const level = Number(levelStr);
		if (level >= 300) {
			expertKC += qty;
			continue;
		}
		if (level >= 150) {
			normalKC += qty;
			continue;
		}
		entryKC += qty;
	}
	return { entryKC, normalKC, expertKC, totalKC: entryKC + normalKC + expertKC };
}

export async function toaHelpCommand(user: MUser, channelID: string) {
	const gearStats = calculateUserGearPercents(user.gear, 300);
	const userStats = await user.fetchStats();
	const { entryKC, normalKC, expertKC, totalKC } = await getToaKCs(userStats);

	let totalUniques = 0;
	for (const item of TOAUniqueTable.allItems) {
		totalUniques += user.cl.amount(item);
	}

	let str = `**Tombs of Amascut** 

**Attempts:** ${userStats.toa_attempts} 
**Entry Mode:** ${entryKC} KC
**Normal Mode:** ${normalKC} KC
**Expert Mode:** ${expertKC} KC
**Total Uniques:** ${totalUniques} ${
		totalUniques > 0
			? `(1 unique per ${Math.floor(
					userStats.total_toa_points / totalUniques
			  ).toLocaleString()} pts, one unique every ${Math.floor(
					totalKC / totalUniques
			  )} raids, one unique every ${formatDuration(
					(userStats.total_toa_duration_minutes * 1000) / totalUniques
			  )})`
			: ''
	}

**Requirements**
${toaRequirements
	.map(i => {
		let res = i.doesMeet({ user, gearStats });
		if (typeof res === 'string') {
			return `- ❌ ${bold(i.name)} ${res}`;
		}

		return `- ✅ ${bold(i.name)}`;
	})
	.join('\n')}

**Ready:** ${await toaCheckCommand(user)}

${calculateBoostString(user)}
`;

	return channelID === '1069176960523190292' ? { content: str, ephemeral: true } : str;
}
