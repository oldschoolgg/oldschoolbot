import { Time, calcPercentOfNum, calcWhatPercent, randFloat, randInt, reduceNumByPercent, round } from 'e';
import { Bank, type Item } from 'oldschooljs';

import type { GearStats } from '../gear/types';
import { blowpipeDarts } from '../minions/functions/blowpipeCommand';
import { Gear, constructGearSetup } from '../structures/Gear';
import { randomVariation, resolveItems } from '../util';
import getOSItem from '../util/getOSItem';
import { logError } from '../util/logError';

interface TOBRoom {
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
	const deaths: number[] = [];
	const wipeDeaths: number[] = [];
	const realDeathChances: { name: string; deathChance: number }[] = [];
	const wipeDeathChances: { name: string; deathChance: number }[] = [];

	// These numbers are for proficiency. After this point, the odds of a wipe are the same, but deaths are reduced.
	const minionProfiencyKC = isHardMode ? 75 : 50;
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
		const realDeathChance =
			baseKC >= minionProfiencyKC ? wipeDeathChance / actualDeathReductionFactor : wipeDeathChance;
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
		const maxMeleeStat = Math.max(maxStats.attack_stab, Math.max(maxStats.attack_slash, maxStats.attack_crush));
		const userMeleeStat = Math.max(userStats.attack_stab, Math.max(userStats.attack_slash, userStats.attack_crush));
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
	ring: 'Magus ring'
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
	ring: 'Venator ring',
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
	ring: 'Ultor ring'
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

interface ItemBoost {
	item: Item;
	boost: number;
	mustBeEquipped: boolean;
	setup?: 'mage' | 'range' | 'melee';
}

const itemBoosts: ItemBoost[][] = [
	[
		{
			item: getOSItem('Scythe of vitur'),
			boost: 15,
			mustBeEquipped: true,
			setup: 'melee'
		},
		{
			item: getOSItem('Scythe of vitur (uncharged)'),
			boost: 6,
			mustBeEquipped: true,
			setup: 'melee'
		},
		{
			item: getOSItem('Blade of saeldor (c)'),
			boost: 6,
			mustBeEquipped: true,
			setup: 'melee'
		},
		{
			item: getOSItem('Abyssal tentacle'),
			boost: 5.5,
			mustBeEquipped: true,
			setup: 'melee'
		}
	],
	[
		{
			item: getOSItem('Twisted bow'),
			boost: 4,
			mustBeEquipped: true,
			setup: 'range'
		}
	],
	[
		{
			item: getOSItem('Dragon claws'),
			boost: 6,
			mustBeEquipped: false
		},
		{
			item: getOSItem('Crystal halberd'),
			boost: 3,
			mustBeEquipped: false
		}
	],
	[
		{
			item: getOSItem('Dragon warhammer'),
			boost: 6,
			mustBeEquipped: false
		},
		{
			item: getOSItem('Bandos godsword'),
			boost: 3,
			mustBeEquipped: false
		}
	]
];

const speedReductionForGear = 16;
const speedReductionForKC = 40;
const speedReductionForDarts = 4;

const maxSpeedReductionFromItems = itemBoosts.reduce(
	(sum, items) => sum + Math.max(...items.map(item => item.boost)),
	0
);
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

	const individualReductions = [];

	const reductions: Record<string, number> = {};

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
		for (const itemBoost of itemBoosts) {
			for (const item of itemBoost) {
				if (item.mustBeEquipped) {
					if (item.setup && u.user.gear[item.setup].hasEquipped(item.item.id)) {
						userPercentChange += item.boost;
						break;
					} else if (!item.setup && u.user.hasEquipped(item.item.id)) {
						userPercentChange += item.boost;
						break;
					}
				} else if (u.user.hasEquippedOrInBank(item.item.id)) {
					userPercentChange += item.boost;
					break;
				}
			}
		}

		const regularVoid = resolveItems([
			'Void knight top',
			'Void knight robe',
			'Void knight gloves',
			'Void ranger helm'
		]);
		const eliteVoid = resolveItems(['Elite void top', 'Elite void robe', 'Void knight gloves', 'Void ranger helm']);
		if (!u.gear.range.hasEquipped(regularVoid, true, true)) {
			userPercentChange = reduceNumByPercent(userPercentChange, 20);
		} else if (!u.gear.range.hasEquipped(eliteVoid, true, true)) {
			userPercentChange = reduceNumByPercent(userPercentChange, 10);
		}

		const reduction = round(userPercentChange / teamSize, 1);

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

	if (duration < Time.Minute * 20) {
		duration = Math.max(Time.Minute * 20, duration);
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
	const parsedTeam: ParsedTeamMember[] = [];

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

	const duration = Math.floor(randomVariation(baseDuration, 5));

	let wipedRoom: TOBRoom | null = null;
	let deathDuration: number | null = 0;
	for (let i = 0; i < TOBRooms.length; i++) {
		const room = TOBRooms[i];

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
