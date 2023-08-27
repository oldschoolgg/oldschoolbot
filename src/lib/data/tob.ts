import { calcPercentOfNum, calcWhatPercent, randFloat, randInt, reduceNumByPercent, round, Time } from 'e';
import { Bank } from 'oldschooljs';
import { randomVariation } from 'oldschooljs/dist/util';

import type { GearStats } from '../gear/types';
import { blowpipeDarts } from '../minions/functions/blowpipeCommand';
import { constructGearSetup, Gear } from '../structures/Gear';
import getOSItem from '../util/getOSItem';
import { logError } from '../util/logError';
import resolveItems from '../util/resolveItems';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit, pernixOutfit } from './CollectionsExport';

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
	head: 'Virtus mask',
	neck: 'Occult necklace',
	body: 'Virtus robe top',
	cape: 'Vasa cloak',
	hands: 'Virtus gloves',
	legs: 'Virtus robe legs',
	feet: 'Virtus boots',
	weapon: 'Virtus wand',
	shield: 'Virtus book',
	ring: 'Magus ring'
});
const maxMage = new Gear(TOBMaxMageGear);

export const TOBMaxRangeGear = constructGearSetup({
	head: 'Pernix cowl',
	neck: 'Necklace of anguish',
	body: 'Pernix body',
	cape: 'Tidal collector',
	hands: 'Pernix gloves',
	legs: 'Pernix chaps',
	feet: 'Pernix boots',
	'2h': 'Twisted bow',
	ring: 'Ring of piercing(i)',
	ammo: 'Dragon arrow'
});
const maxRange = new Gear(TOBMaxRangeGear);
maxRange.ammo!.quantity = 10_000;

export const TOBMaxMeleeGear = constructGearSetup({
	head: 'Torva full helm',
	neck: 'Amulet of torture',
	body: 'Torva platebody',
	cape: 'Tzkal cape',
	hands: 'Torva gloves',
	legs: 'Torva platelegs',
	feet: 'Torva boots',
	weapon: 'Drygore longsword',
	shield: 'Offhand drygore longsword',
	ring: 'Ignis ring (i)'
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
const speedReductionForDarts = 4;

const maxSpeedReductionFromItems = 43;
const maxSpeedReductionUser =
	(speedReductionForGear + speedReductionForKC + speedReductionForDarts) * 1.3 + maxSpeedReductionFromItems;

const baseDuration = Time.Minute * 70;
const baseHardDuration = Time.Minute * 75;

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
interface TobTeam {
	user: MUser;
	gear: { melee: Gear; range: Gear; mage: Gear };
	bank: Bank;
	kc: number;
	hardKC: number;
	attempts: number;
	hardAttempts: number;
}

export function calcTOBBaseDuration({ team, hardMode }: { team: TobTeam[]; hardMode: boolean }) {
	const teamSize = team.length;

	let individualReductions = [];

	let reductions: Record<string, number> = {};

	for (const u of team) {
		let userPercentChange = 0;

		// Reduce time for gear
		const gearPercents = calculateTOBUserGearPercents(u.user);
		// Blowpipe
		const darts = u.user.blowpipe.dartID!;
		const dartItem = getOSItem(darts);
		const dartIndex = blowpipeDarts.indexOf(dartItem);
		let blowPipePercent = 0;
		if (dartIndex >= 3) {
			blowPipePercent = (dartIndex / (blowpipeDarts.length - 1)) * speedReductionForDarts;
		} else {
			blowPipePercent = -(4 * (4 - dartIndex)) / 2;
		}
		userPercentChange += calcPerc(gearPercents.total, speedReductionForGear + blowPipePercent);

		// Reduce time for KC
		const kcPercent = kcEffectiveness(u.attempts, u.hardAttempts, hardMode);
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
		const hasGorajanArcher = u.gear.range.hasEquipped(gorajanArcherOutfit, true);
		if (hasGorajanArcher || u.gear.range.hasEquipped(pernixOutfit, true)) {
			userPercentChange += hasGorajanArcher ? 2 : 0;
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
		duration = baseHardDuration;
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
	return {
		baseDuration: duration,
		reductions,
		maxUserReduction: maxSpeedReductionUser / teamSize
	};
}
export function createTOBRaid({
	team,
	hardMode,
	baseDuration,
	disableVariation
}: {
	team: TobTeam[];
	baseDuration: number;
	hardMode: boolean;
	disableVariation?: true;
}): { duration: number; parsedTeam: ParsedTeamMember[]; wipedRoom: TOBRoom | null; deathDuration: number | null } {
	let parsedTeam: ParsedTeamMember[] = [];

	for (const u of team) {
		const gearPercents = calculateTOBUserGearPercents(u.user);
		const deathChances = calculateTOBDeaths(u.kc, u.hardKC, u.attempts, u.hardAttempts, hardMode, gearPercents);
		parsedTeam.push({
			kc: u.kc,
			hardKC: u.hardKC,
			deathChances,
			wipeDeaths: team.length === 1 ? deathChances.deaths : deathChances.wipeDeaths,
			deaths: deathChances.deaths,
			id: u.user.id
		});
	}

	let duration = Math.floor(randomVariation(baseDuration, 5));

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
		parsedTeam,
		wipedRoom,
		deathDuration
	};
}
