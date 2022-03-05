import { calcPercentOfNum, calcWhatPercent, randInt, reduceNumByPercent, round, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { checkUserCanUseDegradeableItem } from '../degradeableItems';
import { constructGearSetup, GearStats } from '../gear';
import { blowpipeDarts } from '../minions/functions/blowpipeCommand';
import getUserFoodFromBank from '../minions/functions/getUserFoodFromBank';
import { getMinigameScore } from '../settings/minigames';
import { UserSettings } from '../settings/types/UserSettings';
import { Gear } from '../structures/Gear';
import { Skills } from '../types';
import { assert, formatSkillRequirements, randFloat, randomVariation, skillsMeetRequirements } from '../util';
import getOSItem from '../util/getOSItem';
import resolveItems from '../util/resolveItems';
import {
	gorajanArcherOutfit,
	gorajanOccultOutfit,
	gorajanWarriorOutfit,
	pernixOutfit,
	torvaOutfit,
	virtusOutfit
} from './CollectionsExport';

export const bareMinStats: Skills = {
	attack: 90,
	strength: 90,
	defence: 90,
	ranged: 90,
	magic: 94,
	prayer: 77
};

export const totalXPFromRaid = {
	[SkillsEnum.Attack]: 12_000,
	[SkillsEnum.Hitpoints]: 13_100,
	[SkillsEnum.Strength]: 12_000,
	[SkillsEnum.Ranged]: 1000,
	[SkillsEnum.Defence]: 12_000,
	[SkillsEnum.Magic]: 1000
} as const;

export interface TOBRoom {
	name: string;
	difficultyRating: number;
	timeWeighting: number;
}
export const TOBRooms: TOBRoom[] = [
	{
		name: 'Maiden',
		difficultyRating: 1,
		timeWeighting: 11
	},
	{
		name: 'Bloat',
		difficultyRating: 4,
		timeWeighting: 11
	},
	{
		name: 'Nylocas',
		difficultyRating: 3,
		timeWeighting: 22
	},
	{
		name: 'Sotetseg',
		difficultyRating: 2,
		timeWeighting: 11
	},
	{
		name: 'Xarpus',
		difficultyRating: 2,
		timeWeighting: 17
	},
	{
		name: 'Verzik',
		difficultyRating: 6,
		timeWeighting: 28
	}
];

interface TOBDeaths {
	/**
	 * An array, where each item is the index of the room they died in.
	 */
	deaths: number[]; // If they actually died or not
	wipeDeaths: number[]; // Used to determine wipe chance
	deathChances: { name: string; deathChance: number }[];
	wipeDeathChances: { name: string; deathChance: number }[];
}

export function calculateTOBDeaths(
	kc: number,
	hardKC: number,
	attempts: number,
	hardAttempts: number,
	isHardMode: boolean,
	gear: {
		melee: number;
		range: number;
		mage: number;
		total: number;
	},
	solo: boolean = false
): TOBDeaths {
	let deaths: number[] = [];
	let wipeDeaths: number[] = [];
	let realDeathChances: { name: string; deathChance: number }[] = [];
	let wipeDeathChances: { name: string; deathChance: number }[] = [];

	// These numbers are for proficiency. After this point, the odds of a wipe are the same, but deaths are reduced.
	const actualDeathReductionFactor = isHardMode ? 3 : 4;

	// This shifts the graph left or right, to start getting kc sooner or later. Higher = sooner:
	const minionLearningBase = isHardMode ? 5 : 2;
	const minionLearning = minionLearningBase + Math.floor(Math.min(20, (isHardMode ? hardAttempts : attempts) / 2));
	const basePosition = isHardMode ? 92 : 85;
	const difficultySlider = isHardMode ? 34 : 36; // Lower is harder. Be careful with this. (30 default).
	const curveStrength = isHardMode ? 1.5 : 2.5; // 1 - 5. Higher numbers mean a slower learning curve. (2.5 default)
	const baseKC = isHardMode ? hardKC : kc;

	let baseDeathChance = Math.floor(
		basePosition - (Math.log(baseKC / curveStrength + minionLearning) / Math.log(Math.sqrt(100))) * difficultySlider
	);

	baseDeathChance = Math.max(Math.min(baseDeathChance, 99.9), 3);

	if (gear.total < 75) {
		baseDeathChance = 100;
	}
	for (const setup of [gear.mage, gear.melee, gear.range]) {
		if (setup < 80) {
			baseDeathChance += (80 - setup) * 2;
		}
	}

	for (let i = 0; i < TOBRooms.length; i++) {
		const room = TOBRooms[i];
		let wipeDeathChance = Math.min(98, (1 + room.difficultyRating / 10) * baseDeathChance);
		const realDeathChance = wipeDeathChance / actualDeathReductionFactor;
		if (solo) wipeDeathChance = realDeathChance;
		const roll = randFloat(0, 100);
		if (roll < realDeathChance) {
			deaths.push(i);
		}
		if (roll < wipeDeathChance) {
			wipeDeaths.push(i);
		}
		realDeathChances.push({ name: room.name, deathChance: realDeathChance });
		wipeDeathChances.push({ name: room.name, deathChance: wipeDeathChance });
	}

	return { deaths, wipeDeaths, deathChances: realDeathChances, wipeDeathChances };
}

export const baseTOBUniques = resolveItems([
	'Scythe of vitur (uncharged)',
	'Ghrazi rapier',
	'Sanguinesti staff (uncharged)',
	'Justiciar faceguard',
	'Justiciar chestguard',
	'Justiciar legguards',
	'Avernic defender hilt'
]);

export const TOBUniques = resolveItems([
	...baseTOBUniques,
	"Lil' zik",
	'Sanguine dust',
	'Sanguine ornament kit',
	'Holy ornament kit'
]);

export const TOBUniquesToAnnounce = resolveItems([
	'Scythe of vitur (uncharged)',
	'Ghrazi rapier',
	'Sanguinesti staff (uncharged)',
	'Justiciar faceguard',
	'Justiciar chestguard',
	'Justiciar legguards',
	"Lil' zik",
	'Sanguine dust',
	'Sanguine ornament kit',
	'Holy ornament kit'
]);

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

export const TOBMaxMageGear = constructGearSetup({
	head: 'Virtus mask',
	neck: 'Arcane blast necklace',
	body: 'Virtus robe top',
	cape: 'Vasa cloak',
	hands: 'Virtus gloves',
	legs: 'Virtus robe legs',
	feet: 'Virtus boots',
	weapon: 'Virtus wand',
	shield: 'Virtus book',
	ring: 'Seers ring(i)'
});
const maxMage = new Gear(TOBMaxMageGear);

export const TOBMaxRangeGear = constructGearSetup({
	head: 'Pernix cowl',
	neck: 'Farsight snapshot necklace',
	body: 'Pernix body',
	cape: "Ava's assembler",
	hands: 'Pernix gloves',
	legs: 'Pernix chaps',
	feet: 'Pernix boots',
	'2h': 'Twisted bow',
	ring: 'Archers ring(i)',
	ammo: 'Dragon arrow'
});
const maxRange = new Gear(TOBMaxRangeGear);
maxRange.ammo!.quantity = 10_000;

export const TOBMaxMeleeGear = constructGearSetup({
	head: 'Torva full helm',
	neck: "Brawler's hook necklace",
	body: 'Torva platebody',
	cape: 'Tzkal cape',
	hands: 'Torva gloves',
	legs: 'Torva platelegs',
	feet: 'Torva boots',
	weapon: 'Drygore longsword',
	shield: 'Offhand drygore longsword',
	ring: 'Ignis ring(i)'
});
const maxMelee = new Gear(TOBMaxMeleeGear);

export function calculateTOBUserGearPercents(user: KlasaUser) {
	const melee = calcSetupPercent(
		maxMelee.stats,
		user.getGear('melee').stats,
		'melee_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_ranged', 'attack_magic'],
		true
	);
	const range = calcSetupPercent(
		maxRange.stats,
		user.getGear('range').stats,
		'ranged_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_magic'],
		false
	);
	const mage = calcSetupPercent(
		maxMage.stats,
		user.getGear('mage').stats,
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

export const minimumTOBSuppliesNeeded = new Bank({
	'Saradomin brew(4)': 10,
	'Super restore(4)': 5
});

export const TENTACLE_CHARGES_PER_RAID = 400;

export async function checkTOBUser(
	user: KlasaUser,
	isHardMode: boolean,
	_teamSize?: number
): Promise<[false] | [true, string]> {
	if (!user.hasMinion) {
		return [true, `${user.username} doesn't have a minion`];
	}
	if (user.minionIsBusy) {
		return [true, `${user.username} minion is busy`];
	}

	if (!skillsMeetRequirements(user.rawSkills, bareMinStats)) {
		return [
			true,
			`${
				user.username
			} doesn't meet the skill requirements to do the Theatre of Blood, you need: ${formatSkillRequirements(
				bareMinStats
			)}.`
		];
	}

	if (!user.owns(minimumTOBSuppliesNeeded)) {
		return [
			true,
			`${user.username} doesn't have enough items, you need a minimum of this amount of items: ${minimumTOBSuppliesNeeded}.`
		];
	}
	const { total } = calculateTOBUserGearPercents(user);
	if (total < 20) {
		return [true, `${user.username}'s gear is terrible! You do not stand a chance in the Theatre of Blood.`];
	}

	const cost = await calcTOBInput(user);
	cost.add('Coins', 100_000).add('Rune pouch');
	if (!user.owns(cost)) {
		return [true, `${user.username} doesn't own ${cost.remove(user.bank())}`];
	}

	/**
	 *
	 *
	 * Gear
	 *
	 *
	 */

	// Melee
	const meleeGear = user.getGear('melee');
	if (
		!meleeGear.hasEquipped([
			'Abyssal tentacle',
			'Blade of saeldor (c)',
			'Scythe of vitur (uncharged)',
			'Scythe of vitur',
			'Drygore longsword',
			'Chaotic longsword'
		]) ||
		!meleeGear.hasEquipped(['Fire cape', 'Infernal cape'])
	) {
		return [
			true,
			`${user.username} needs an Abyssal tentacle/Blade of saeldor(c)/Scythe of vitur/Drygore longsword/Chaotic longsword and Fire/Infernal cape in their melee setup!`
		];
	}

	if (meleeGear.hasEquipped('Abyssal tentacle')) {
		const tentacleResult = checkUserCanUseDegradeableItem({
			item: getOSItem('Abyssal tentacle'),
			chargesToDegrade: TENTACLE_CHARGES_PER_RAID,
			user
		});
		if (!tentacleResult.hasEnough) {
			return [true, tentacleResult.userMessage];
		}
	}

	// Range
	const blowpipeData = user.settings.get(UserSettings.Blowpipe);
	if (!user.owns('Toxic blowpipe') || !blowpipeData.scales || !blowpipeData.dartID || !blowpipeData.dartQuantity) {
		return [
			true,
			`${user.username} needs a Toxic blowpipe (with darts and scales equipped) in their bank to do the Theatre of Blood.`
		];
	}
	if (blowpipeData.dartQuantity < 150) {
		return [true, `${user.username}, you need atleast 150 darts in your blowpipe.`];
	}
	if (blowpipeData.scales < 1000) {
		return [true, `${user.username}, you need atleast 1000 scales in your blowpipe.`];
	}
	const dartIndex = blowpipeDarts.indexOf(getOSItem(blowpipeData.dartID));
	if (dartIndex < 5) {
		return [true, `${user.username}'s darts are too weak`];
	}

	const rangeGear = user.getGear('range');
	if (
		!rangeGear.hasEquipped(['Magic shortbow', 'Twisted bow', 'Zaryte bow', 'Hellfire bow']) ||
		!rangeGear.hasEquipped(['Amethyst arrow', 'Rune arrow', 'Dragon arrow'])
	) {
		return [
			true,
			`${user.username} needs a Magic shortbow, Twisted bow, Zaryte bow, or Hellfire bow, and rune/dragon arrows, in their range setup!`
		];
	}
	if (rangeGear.hasEquipped(['Dragon arrow', 'Magic shortbow'], true)) {
		return [true, `${user.username}, you can't use Dragon arrows with a Magic shortbow 🤨`];
	}

	if (rangeGear.ammo!.quantity < 150) {
		return [true, `${user.username}, you need atleast 150 arrows equipped in your range setup.`];
	}

	if (isHardMode) {
		const kc = await getMinigameScore(user.id, 'tob');

		if (kc < 250) {
			return [true, `${user.username} needs atleast 250 Theatre of Blood KC before doing Hard mode.`];
		}
		if (!meleeGear.hasEquipped('Infernal cape')) {
			return [true, `${user.username} needs an Infernal cape to do Hard mode.`];
		}
	}

	return [false];
}

export async function checkTOBTeam(users: KlasaUser[], isHardMode: boolean): Promise<string | null> {
	const userWithoutSupplies = users.find(u => !u.owns(minimumTOBSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.username} doesn't have enough supplies`;
	}

	for (const user of users) {
		const checkResult = await checkTOBUser(user, isHardMode, users.length);
		if (!checkResult[0]) {
			continue;
		} else {
			return checkResult[1];
		}
	}

	return null;
}

function kcEffectiveness(normalKC: number, hardKC: number, hardMode: boolean) {
	const kc = hardMode ? hardKC : normalKC;
	let cap = 400;
	if (hardMode) {
		cap = 100;
	}
	const kcEffectiveness = Math.min(100, calcWhatPercent(kc, cap));
	return kcEffectiveness;
}

const speedReductionForGear = 16;
const speedReductionForKC = 40;
const totalSpeedReductions = speedReductionForGear + speedReductionForKC + 15 + 4;
const baseDuration = Time.Minute * 70;
const baseCmDuration = Time.Minute * 75;

const { ceil } = Math;
function calcPerc(perc: number, num: number) {
	return ceil(calcPercentOfNum(ceil(perc), num));
}

interface ParsedTeamMember {
	id: string;
	kc: number;
	hardKC: number;
	deathChances: TOBDeaths;
	deaths: number[];
	wipeDeaths: number[];
}

export function createTOBTeam({
	team,
	hardMode,
	disableVariation
}: {
	team: {
		user: KlasaUser;
		gear: { melee: Gear; range: Gear; mage: Gear };
		bank: Bank;
		kc: number;
		hardKC: number;
		attempts: number;
		hardAttempts: number;
	}[];
	hardMode: boolean;
	disableVariation?: true;
}): {
	reductions: Record<string, number>;
	duration: number;
	totalReduction: number;
	parsedTeam: ParsedTeamMember[];
	wipedRoom: TOBRoom | null;
	deathDuration: number | null;
} {
	const teamSize = team.length;
	const maxScaling = 350;
	assert(teamSize > 0 && teamSize < 6, 'TOB team must be 1-5 users');

	let individualReductions = [];

	let reductions: Record<string, number> = {};

	let parsedTeam: ParsedTeamMember[] = [];

	for (const u of team) {
		let userPercentChange = 0;

		// Reduce time for gear
		const gearPerecents = calculateTOBUserGearPercents(u.user);
		// Blowpipe
		const darts = u.user.settings.get(UserSettings.Blowpipe).dartID!;
		const dartItem = getOSItem(darts);
		const dartIndex = blowpipeDarts.indexOf(dartItem);
		const blowPipePercent = dartIndex >= 3 ? dartIndex * 0.9 : -(4 * (4 - dartIndex));
		userPercentChange += calcPerc(gearPerecents.total, (speedReductionForGear + blowPipePercent) / 2);

		// Reduce time for KC
		const kcPercent = kcEffectiveness(
			Math.min(u.attempts, maxScaling),
			Math.min(u.hardAttempts, maxScaling),
			hardMode
		);
		userPercentChange += calcPerc(kcPercent, speedReductionForKC);

		const maxKcCurveBonus = 30;
		const durationCurveModifier = Math.min(maxKcCurveBonus, kcPercent * 0.6);
		userPercentChange *= 1 + durationCurveModifier / 100;

		/**
		 *
		 * Item/Gear Boosts
		 *
		 */
		const meleeWeaponBoosts = [
			['Scythe of vitur', 10],
			['Drygore longsword', 9],
			['Chaotic longsword', 7.5],
			['Scythe of vitur (uncharged)', 6],
			['Blade of saeldor (c)', 6],
			['Abyssal tentacle', 5.5]
		] as const;
		for (const [name, percent] of meleeWeaponBoosts) {
			if (u.gear.melee.hasEquipped(name)) {
				userPercentChange += percent;
				break;
			}
		}
		const meleeOffhandBoosts = [
			['Offhand drygore longsword', 5],
			['Offhand chaotic longsword', 4],
			['Avernic defender', 3],
			['Dragon defender', 1]
		] as const;
		for (const [name, percent] of meleeOffhandBoosts) {
			if (u.gear.melee.hasEquipped(name)) {
				userPercentChange += percent;
				break;
			}
		}
		const rangeWeaponBoosts = [
			['Hellfire bow', 8],
			['Zaryte bow', 7],
			['Twisted bow', 5]
		] as const;
		for (const [name, percent] of rangeWeaponBoosts) {
			if (u.gear.range.hasEquipped(name)) {
				userPercentChange += percent;
				break;
			}
		}
		const primarySpecWeaponBoosts = [
			['Dwarven warhammer', 10],
			['Dragon claws', 6],
			['Crystal halberd', 3]
		] as const;
		for (const [name, percent] of primarySpecWeaponBoosts) {
			if (u.user.hasItemEquippedOrInBank(name)) {
				userPercentChange += percent;
				break;
			}
		}
		const secondarySpecWeaponBoosts = [
			['Dragon warhammer', 6],
			['Bandos godsword', 3]
		] as const;
		for (const [name, percent] of secondarySpecWeaponBoosts) {
			if (u.user.hasItemEquippedOrInBank(name)) {
				userPercentChange += percent;
				break;
			}
		}

		// Add boosts for Torva / Virtus (4% gorajan, 2% nex)
		if (u.gear.melee.hasEquipped(gorajanWarriorOutfit, true, true)) {
			userPercentChange += 4;
		} else if (u.gear.melee.hasEquipped(torvaOutfit, true, true)) {
			userPercentChange += 2;
		}
		if (u.gear.mage.hasEquipped(gorajanOccultOutfit, true, true)) {
			userPercentChange += 4;
		} else if (u.gear.mage.hasEquipped(virtusOutfit, true, true)) {
			userPercentChange += 2;
		}

		const regularVoid = resolveItems([
			'Void knight top',
			'Void knight robe',
			'Void knight gloves',
			'Void ranger helm'
		]);
		const eliteVoid = resolveItems(['Elite void top', 'Elite void robe', 'Void knight gloves', 'Void ranger helm']);

		// 4%/2% boost for Gorajan / Pernix, same 20%/10% penalty for neither and missing void/elite.
		if (u.gear.range.hasEquipped(gorajanArcherOutfit, true, true)) {
			userPercentChange += 4;
		} else if (u.gear.range.hasEquipped(pernixOutfit, true, true)) {
			userPercentChange += 2;
		} else if (!u.gear.range.hasEquipped(regularVoid, true, true)) {
			userPercentChange = reduceNumByPercent(userPercentChange, 20);
		} else if (!u.gear.range.hasEquipped(eliteVoid, true, true)) {
			userPercentChange = reduceNumByPercent(userPercentChange, 10);
		}

		const deathChances = calculateTOBDeaths(
			u.kc,
			u.hardKC,
			u.attempts,
			u.hardAttempts,
			hardMode,
			gearPerecents,
			teamSize === 1
		);
		parsedTeam.push({
			kc: u.kc,
			hardKC: u.hardKC,
			deathChances,
			wipeDeaths: deathChances.wipeDeaths,
			deaths: deathChances.deaths,
			id: u.user.id
		});

		let reduction = round(userPercentChange / teamSize, 1);

		individualReductions.push(userPercentChange);
		reductions[u.user.id] = reduction;
	}
	let duration = baseDuration;

	// Double base duration for solo
	if (teamSize === 1) duration *= 2;

	// Get the sum of individualReductions array
	let totalReduction = individualReductions.reduce((a, c) => a + c);

	// Remove the worst player from speed calculation if team size > 2:
	if (teamSize > 2) {
		totalReduction -= Math.min(...individualReductions);
		totalReduction = round(totalReduction / (teamSize - 1), 2);
	} else {
		totalReduction = round(totalReduction / teamSize, 2);
	}
	if (hardMode) {
		duration = baseCmDuration;
		duration = reduceNumByPercent(duration, totalReduction / 1.3);
	} else {
		duration = reduceNumByPercent(duration, totalReduction);
	}

	if (team.length < 5) {
		duration += (5 - team.length) * (Time.Minute * 1.3);
	}

	// Lower minimum duration for BSO: 15 minutes instead of 20
	const minDuration = teamSize === 1 ? 20 : 15;
	if (duration < Time.Minute * minDuration) {
		duration = Math.max(Time.Minute * minDuration, duration);
	}

	duration = Math.floor(randomVariation(duration, 5));

	let wipedRoom: TOBRoom | null = null;
	let deathDuration: number | null = 0;
	for (let i = 0; i < TOBRooms.length; i++) {
		let room = TOBRooms[i];

		if (parsedTeam.every(member => member.wipeDeaths.includes(i))) {
			wipedRoom = room;
			deathDuration += Math.floor(
				calcPercentOfNum(disableVariation ? room.timeWeighting / 2 : randInt(1, room.timeWeighting), duration)
			);
			break;
		} else {
			deathDuration += Math.floor(calcPercentOfNum(room.timeWeighting, duration));
		}
	}

	if (!wipedRoom) deathDuration = null;

	return {
		duration,
		reductions,
		totalReduction: totalSpeedReductions / teamSize,
		parsedTeam,
		wipedRoom,
		deathDuration
	};
}

export async function calcTOBInput(u: KlasaUser) {
	const items = new Bank();
	const kc = await u.getMinigameScore('tob');
	items.add('Super combat potion(4)', 1);
	items.add('Ranging potion(4)', 1);

	let brewsNeeded = Math.max(1, 6 - Math.max(1, Math.ceil((kc + 1) / 10)));
	const restoresNeeded = Math.max(2, Math.floor(brewsNeeded / 3));

	let healingNeeded = 60;
	if (kc < 20) {
		items.add('Cooked karambwan', 3);
		healingNeeded += 40;
	}

	items.add(
		getUserFoodFromBank(u, healingNeeded, u.settings.get(UserSettings.FavoriteFood), false, 20) ||
			new Bank().add('Shark', 5)
	);

	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);

	items.add('Blood rune', 110);
	items.add('Death rune', 100);
	items.add('Water rune', 800);

	if (u.getGear('melee').hasEquipped('Scythe of vitur')) {
		items.add('Blood rune', 600);
		items.add('Vial of blood', 2);
	}

	return items;
}
