import { calcPercentOfNum, calcWhatPercent, randInt, reduceNumByPercent, round, Time } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { checkUserCanUseDegradeableItem } from '../degradeableItems';
import { constructGearSetup, GearStats } from '../gear';
import { blowpipeDarts } from '../minions/functions/blowpipeCommand';
import getUserFoodFromBank from '../minions/functions/getUserFoodFromBank';
import { getMinigameScore } from '../settings/minigames';
import { Gear } from '../structures/Gear';
import { Skills } from '../types';
import { assert, formatSkillRequirements, randFloat, randomVariation, skillsMeetRequirements } from '../util';
import getOSItem from '../util/getOSItem';
import { logError } from '../util/logError';
import resolveItems from '../util/resolveItems';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from './CollectionsExport';

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
	}
): TOBDeaths {
	let deaths: number[] = [];
	let wipeDeaths: number[] = [];
	let realDeathChances: { name: string; deathChance: number }[] = [];
	let wipeDeathChances: { name: string; deathChance: number }[] = [];

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
		const wipeDeathChance = Math.min(98, (1 + room.difficultyRating / 10) * baseDeathChance);
		const realDeathChance = wipeDeathChance / actualDeathReductionFactor;
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
	head: 'Ancestral hat',
	neck: 'Occult necklace',
	body: 'Ancestral robe top',
	cape: 'Imbued saradomin cape',
	hands: 'Tormented bracelet',
	legs: 'Ancestral robe bottom',
	feet: 'Eternal boots',
	weapon: 'Kodai wand',
	shield: 'Arcane spirit shield',
	ring: 'Seers ring(i)'
});
const maxMage = new Gear(TOBMaxMageGear);

export const TOBMaxRangeGear = constructGearSetup({
	head: 'Void ranger helm',
	neck: 'Necklace of anguish',
	body: 'Elite void top',
	cape: "Ava's assembler",
	hands: 'Void knight gloves',
	legs: 'Elite void robe',
	feet: 'Pegasian boots',
	'2h': 'Twisted bow',
	ring: 'Archers ring(i)',
	ammo: 'Dragon arrow'
});
const maxRange = new Gear(TOBMaxRangeGear);
maxRange.ammo!.quantity = 10_000;

export const TOBMaxMeleeGear = constructGearSetup({
	head: 'Torva full helm',
	neck: 'Amulet of torture',
	body: 'Torva platebody',
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: 'Torva platelegs',
	feet: 'Primordial boots',
	'2h': 'Scythe of vitur',
	ring: 'Berserker ring(i)'
});
const maxMelee = new Gear(TOBMaxMeleeGear);

export function calculateTOBUserGearPercents(user: MUser) {
	const melee = calcSetupPercent(
		maxMelee.stats,
		user.gear.melee.stats,
		'melee_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_ranged', 'attack_magic'],
		true
	);
	const range = calcSetupPercent(
		maxRange.stats,
		user.gear.range.stats,
		'ranged_strength',
		['attack_stab', 'attack_slash', 'attack_crush', 'attack_magic'],
		false
	);
	const mage = calcSetupPercent(
		maxMage.stats,
		user.gear.mage.stats,
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
	user: MUser,
	isHardMode: boolean,
	teamSize?: number
): Promise<[false] | [true, string]> {
	if (!user.user.minion_hasBought) {
		return [true, `${user.usernameOrMention} doesn't have a minion`];
	}

	if (!skillsMeetRequirements(user.skillsAsXP, bareMinStats)) {
		return [
			true,
			`${
				user.usernameOrMention
			} doesn't meet the skill requirements to do the Theatre of Blood, you need: ${formatSkillRequirements(
				bareMinStats
			)}.`
		];
	}

	if (!user.owns(minimumTOBSuppliesNeeded)) {
		return [
			true,
			`${user.usernameOrMention} doesn't have enough items, you need a minimum of this amount of items: ${minimumTOBSuppliesNeeded}.`
		];
	}
	const { total } = calculateTOBUserGearPercents(user);
	if (total < 20) {
		return [
			true,
			`${user.usernameOrMention}'s gear is terrible! You do not stand a chance in the Theatre of Blood.`
		];
	}

	const cost = await calcTOBInput(user);
	cost.add('Coins', 100_000).add('Rune pouch');
	if (!user.owns(cost)) {
		return [true, `${user.usernameOrMention} doesn't own ${cost.remove(user.bank)}`];
	}

	/**
	 *
	 *
	 * Gear
	 *
	 *
	 */

	// Melee
<<<<<<< HEAD
	const meleeGear = user.getGear('melee');
	const requiredMeleeWeapons = [
		'Abyssal tentacle',
		'Blade of saeldor (c)',
		'Scythe of vitur (uncharged)',
		'Scythe of vitur',
		'Drygore longsword'
	];
	const requiredMeleeCapes = ['Fire cape', 'Infernal cape', 'TzKal cape'];
	if (!meleeGear.hasEquipped(requiredMeleeWeapons) || !meleeGear.hasEquipped(requiredMeleeCapes)) {
		return [
			true,
			`${user.username} needs one of the following weapons: ${requiredMeleeWeapons.join(
				'/'
			)} and one of the following capes: ${requiredMeleeCapes.join('/')} equipped in their melee setup!`
=======
	const meleeGear = user.gear.melee;
	if (
		!meleeGear.hasEquipped([
			'Abyssal tentacle',
			'Blade of saeldor (c)',
			'Scythe of vitur (uncharged)',
			'Scythe of vitur'
		]) ||
		!meleeGear.hasEquipped(['Fire cape', 'Infernal cape'])
	) {
		return [
			true,
			`${user.usernameOrMention} needs an Abyssal tentacle/Blade of saeldor(c)/Scythe of vitur and Fire/Infernal cape in their melee setup!`
>>>>>>> master
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
	const blowpipeData = user.blowpipe;
	if (!user.owns('Toxic blowpipe') || !blowpipeData.scales || !blowpipeData.dartID || !blowpipeData.dartQuantity) {
		return [
			true,
			`${user.usernameOrMention} needs a Toxic blowpipe (with darts and scales equipped) in their bank to do the Theatre of Blood.`
		];
	}
	if (blowpipeData.dartQuantity < 150) {
		return [true, `${user.usernameOrMention}, you need atleast 150 darts in your blowpipe.`];
	}
	if (blowpipeData.scales < 1000) {
		return [true, `${user.usernameOrMention}, you need atleast 1000 scales in your blowpipe.`];
	}
	const dartIndex = blowpipeDarts.indexOf(getOSItem(blowpipeData.dartID));
	if (dartIndex < 5) {
		return [true, `${user.usernameOrMention}'s darts are too weak`];
	}

<<<<<<< HEAD
	const requiredRangeWeapons = ['Magic shortbow', 'Twisted bow', 'Zaryte bow', 'Hellfire bow'];
	const requiredRangeAmmo = ['Amethyst arrow', 'Rune arrow', 'Dragon arrow', 'Hellfire arrow'];
	const rangeGear = user.getGear('range');
	if (!rangeGear.hasEquipped(requiredRangeWeapons) || !rangeGear.hasEquipped(requiredRangeAmmo)) {
		return [
			true,
			`${user.username} needs one of the following weapons: ${requiredRangeWeapons.join(
				'/'
			)} and one of the following ammo types: ${requiredRangeAmmo.join('/')} equipped in their range setup!`
=======
	const rangeGear = user.gear.range;
	if (
		!rangeGear.hasEquipped(['Magic shortbow', 'Twisted bow']) ||
		!rangeGear.hasEquipped(['Amethyst arrow', 'Rune arrow', 'Dragon arrow'])
	) {
		return [
			true,
			`${user.usernameOrMention} needs a Magic shortbow or Twisted bow, and rune/dragon arrows, in their range setup!`
>>>>>>> master
		];
	}
	if (rangeGear.hasEquipped(['Hellfire arrow']) && !rangeGear.hasEquipped('Hellfire bow')) {
		return [true, `${user.username}, you can't use Hellfire arrows without a Hellfire bow 🤨`];
	}
	if (rangeGear.hasEquipped(['Dragon arrow', 'Magic shortbow'], true)) {
		return [true, `${user.usernameOrMention}, you can't use Dragon arrows with a Magic shortbow 🤨`];
	}

	if (rangeGear.ammo!.quantity < 150) {
		return [true, `${user.usernameOrMention}, you need atleast 150 arrows equipped in your range setup.`];
	}

	if (isHardMode) {
		const kc = await getMinigameScore(user.id, 'tob');

		if (kc < 250) {
			return [true, `${user.usernameOrMention} needs atleast 250 Theatre of Blood KC before doing Hard mode.`];
		}
		if (!meleeGear.hasEquipped('Infernal cape')) {
<<<<<<< HEAD
			return [true, `${user.username} needs at least an Infernal cape to do Hard mode.`];
		}
	}
	if (teamSize === 1) {
		if (
			!meleeGear.hasEquipped(['Drygore longsword', 'Offhand drygore longsword'], true) &&
			!meleeGear.hasEquipped('Scythe of vitur')
		) {
			return [true, 'You must either have a charged Scythe of vitur, or dual Drygore longswords to solo ToB'];
		}
		const minRangeSoloGear = ['Hellfire bow', 'Hellfire arrow'];
		if (!rangeGear.hasEquipped(minRangeSoloGear, true)) {
			return [true, 'You must either have a Hellfire bow and Hellfire arrows equipped to solo ToB'];
		}
		const mageGear = user.getGear('mage');
		if (
			!meleeGear.hasEquipped(gorajanWarriorOutfit, true) &&
			!rangeGear.hasEquipped(gorajanArcherOutfit, true) &&
			!mageGear.hasEquipped(gorajanOccultOutfit, true)
		) {
			return [true, 'You must either have at least one complete set of Gorajan armour to solo ToB'];
=======
			return [true, `${user.usernameOrMention} needs an Infernal cape to do Hard mode.`];
		}
	}

	if (teamSize === 2) {
		const kc = await getMinigameScore(user.id, isHardMode ? 'tob_hard' : 'tob');
		if (kc < 150) {
			return [true, `${user.usernameOrMention} needs atleast 150 KC before doing duo's.`];
>>>>>>> master
		}
	}

	return [false];
}

export async function checkTOBTeam(users: MUser[], isHardMode: boolean): Promise<string | null> {
	const userWithoutSupplies = users.find(u => !u.bank.has(minimumTOBSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.usernameOrMention} doesn't have enough supplies`;
	}
	if (users.length < 1 || users.length > 5) {
		return 'TOB team must be 1-5 users';
	}

	for (const user of users) {
		if (user.minionIsBusy) return `${user.usernameOrMention}'s minion is busy.`;
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
		user: MUser;
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
		const darts = u.user.blowpipe.dartID!;
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
			['Drygore longsword', 10],
			['Offhand drygore longsword', 8],
			['Scythe of vitur', 15],
			['Scythe of vitur (uncharged)', 6],
			['Blade of saeldor (c)', 6],
			['Abyssal tentacle', 5.5]
		] as const;
		for (const [name, percent] of meleeWeaponBoosts) {
			if (u.gear.melee.hasEquipped(name)) {
				userPercentChange += percent;
			}
		}
		const rangeWeaponBoosts = [
			['Hellfire bow', 10],
			['Zaryte bow', 7.5],
			['Twisted bow', 4]
		] as const;
		for (const [name, percent] of rangeWeaponBoosts) {
			if (u.gear.range.hasEquipped(name)) {
				userPercentChange += percent;
				break;
			}
		}
		const primarySpecWeaponBoosts = [
			['Dragon claws', 6],
			['Crystal halberd', 3]
		] as const;
		for (const [name, percent] of primarySpecWeaponBoosts) {
			if (u.user.hasEquippedOrInBank(name)) {
				userPercentChange += percent;
				break;
			}
		}
		const secondarySpecWeaponBoosts = [
			['Dwarven warhammer', 12],
			['Dragon warhammer', 6],
			['Bandos godsword', 3]
		] as const;
		for (const [name, percent] of secondarySpecWeaponBoosts) {
			if (u.user.hasEquippedOrInBank(name)) {
				userPercentChange += percent;
				break;
			}
		}

		const regularVoid = resolveItems([
			'Void knight top',
			'Void knight robe',
			'Void knight gloves',
			'Void ranger helm'
		]);
		const eliteVoid = resolveItems(['Elite void top', 'Elite void robe', 'Void knight gloves', 'Void ranger helm']);
		if (u.gear.range.hasEquipped(gorajanArcherOutfit, true)) {
			userPercentChange += 2;
		} else if (!u.gear.range.hasEquipped(regularVoid, true, true)) {
			userPercentChange = reduceNumByPercent(userPercentChange, 20);
		} else if (!u.gear.range.hasEquipped(eliteVoid, true, true)) {
			userPercentChange = reduceNumByPercent(userPercentChange, 10);
		}
		if (u.gear.melee.hasEquipped(gorajanWarriorOutfit, true)) {
			userPercentChange += 2;
		}
		if (u.gear.mage.hasEquipped(gorajanOccultOutfit, true)) {
			userPercentChange += 2;
		}
		const deathChances = calculateTOBDeaths(u.kc, u.hardKC, u.attempts, u.hardAttempts, hardMode, gearPerecents);
		parsedTeam.push({
			kc: u.kc,
			hardKC: u.hardKC,
			deathChances,
			wipeDeaths: team.length === 1 ? deathChances.deaths : deathChances.wipeDeaths,
			deaths: deathChances.deaths,
			id: u.user.id
		});

		let reduction = round(userPercentChange / teamSize, 1);

		individualReductions.push(userPercentChange);
		reductions[u.user.id] = reduction;
	}
	let duration = baseDuration;

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
	if (duration < Time.Minute * 15) {
		duration = Math.max(Time.Minute * 15, duration);
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

	if (wipedRoom !== null && (!TOBRooms.includes(wipedRoom) || [-1].includes(TOBRooms.indexOf(wipedRoom)))) {
		logError(new Error('Had non-existant wiped room for tob'), {
			room: JSON.stringify(wipedRoom),
			team: JSON.stringify(parsedTeam)
		});
		wipedRoom = null;
	}

	return {
		duration,
		reductions,
		totalReduction: totalSpeedReductions / teamSize,
		parsedTeam,
		wipedRoom,
		deathDuration
	};
}

export async function calcTOBInput(u: MUser) {
	const items = new Bank();
	const kc = await getMinigameScore(u.id, 'tob');
	items.add('Super combat potion(4)', 1);
	items.add('Ranging potion(4)', 1);

	let brewsNeeded = Math.max(1, 6 - Math.max(1, Math.ceil((kc + 1) / 10)));
	const restoresNeeded = Math.max(2, Math.floor(brewsNeeded / 3));

	let healingNeeded = 60;
	if (kc < 20) {
		items.add('Cooked karambwan', 3);
		healingNeeded += 40;
	}

<<<<<<< HEAD
	items.add(
		getUserFoodFromBank(u, healingNeeded, u.settings.get(UserSettings.FavoriteFood), false, 20) ||
			new Bank().add('Shark', 5)
	);
=======
	items.add(getUserFoodFromBank(u, healingNeeded, u.user.favorite_food, 20) || new Bank().add('Shark', 5));
>>>>>>> master

	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);

	items.add('Blood rune', 110);
	items.add('Death rune', 100);
	items.add('Water rune', 800);

	if (u.gear.melee.hasEquipped('Scythe of vitur')) {
		items.add('Blood rune', 600);
		items.add('Vial of blood', 2);
	}

	return items;
}
