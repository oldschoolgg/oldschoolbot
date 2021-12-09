import { calcPercentOfNum, calcWhatPercent, percentChance, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { constructGearSetup, GearStats } from '../gear';
import { getMinigameScore } from '../settings/minigames';
import { Gear } from '../structures/Gear';
import { Skills } from '../types';
import { assert, formatSkillRequirements, randomVariation, skillsMeetRequirements } from '../util';
import getOSItem from '../util/getOSItem';
import resolveItems from '../util/resolveItems';

export const bareMinStats: Skills = {
	attack: 90,
	strength: 90,
	defence: 90,
	ranged: 90,
	magic: 94,
	prayer: 77
};

interface TOBRoom {
	name: string;
	difficultyRating: number;
}
export const TOBRooms: TOBRoom[] = [
	{
		name: 'Maiden',
		difficultyRating: 1
	},
	{
		name: 'Bloat',
		difficultyRating: 4
	},
	{
		name: 'Nylocas',
		difficultyRating: 3
	},
	{
		name: 'Soteseteg',
		difficultyRating: 2
	},
	{
		name: 'Xarps',
		difficultyRating: 2
	},
	{
		name: 'Vitir Verizk',
		difficultyRating: 6
	}
];

interface TOBDeaths {
	/**
	 * An array, where each item is the index of the room they died in.
	 */
	deaths: number[];
	deathChances: { name: string; deathChance: number }[];
}

export function calculateTOBDeaths(kc: number, hardKC: number, isHardMode: boolean): TOBDeaths {
	let deaths: number[] = [];
	let deathChances: { name: string; deathChance: number }[] = [];

	let baseDeathChance = Math.floor(122 - (Math.log(kc + 1) / Math.log(Math.sqrt(35))) * 39);
	// if (attempts < 30) baseDeathChance += 30 - attempts;

	if (isHardMode) {
		baseDeathChance += 100 - hardKC;
	}

	baseDeathChance = Math.max(Math.min(baseDeathChance, 99.9), 0.3);

	for (let i = 0; i < TOBRooms.length; i++) {
		const room = TOBRooms[i];
		const deathChance = room.difficultyRating * baseDeathChance;
		if (percentChance(room.difficultyRating * baseDeathChance)) {
			deaths.push(i);
		}
		deathChances.push({ name: room.name, deathChance });
	}

	return { deaths, deathChances };
}

export const baseTOBUniques = resolveItems([
	'Scythe of vitur',
	'Ghrazi rapier',
	'Sanguinesti staff',
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
	weapon: 'Harmonised nightmare staff',
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

export const TOBMaxMeleeGear = constructGearSetup({
	head: 'Neitiznot faceguard',
	neck: 'Amulet of torture',
	body: 'Bandos chestplate',
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: 'Bandos tassets',
	feet: 'Primordial boots',
	weapon: 'Scythe of vitur',
	ring: 'Berserker ring(i)'
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

export const minimumCoxSuppliesNeeded = new Bank({
	'Stamina potion(4)': 3,
	'Saradomin brew(4)': 10,
	'Super restore(4)': 5
});

export async function checkTOBUser(user: KlasaUser, isHardMode: boolean): Promise<[false] | [true, string]> {
	if (!user.hasMinion) {
		return [true, "you don't have a minion."];
	}
	if (user.minionIsBusy) {
		return [true, 'your minion is busy.'];
	}

	const kc = await getMinigameScore(user.id, 'tob');
	if (isHardMode && kc < 250) {
		return [true, 'you need atleast 250 Theatre of Blood KC before doing Hard mode.'];
	}

	if (!skillsMeetRequirements(user.rawSkills, bareMinStats)) {
		return [
			true,
			`You don't meet the skill requirements to do the Theatre of Blood, you need: ${formatSkillRequirements(
				bareMinStats
			)}.`
		];
	}

	if (!user.owns(minimumCoxSuppliesNeeded)) {
		return [
			true,
			`You don't have enough items, you need a minimum of this amount of items: ${minimumCoxSuppliesNeeded}.`
		];
	}
	const { total } = calculateTOBUserGearPercents(user);
	if (total < 20) {
		return [true, 'Your gear is terrible! You do not stand a chance in the Chambers of Xeric'];
	}

	if (!user.owns('Rune pouch')) {
		return [true, `${user.username} doesn't own a Rune pouch.`];
	}

	const cost = await calcTOBInput(user);
	if (!user.owns(cost)) {
		return [true, `${user.username} doesn't own ${cost}`];
	}

	if (!user.getGear('melee').hasEquipped(['Fire cape', 'Infernal cape'])) {
		return [true, 'You need atleast an Infernal or Fire cape in your melee setup!'];
	}

	return [false];
}

export async function checkTOBTeam(users: KlasaUser[], isHardMode: boolean): Promise<string | null> {
	const userWithoutSupplies = users.find(u => !u.owns(minimumCoxSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.username} doesn't have enough supplies`;
	}

	for (const user of users) {
		const checkResult = await checkTOBUser(user, isHardMode);
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
const totalSpeedReductions = speedReductionForGear + speedReductionForKC + 10 + 5;
const baseDuration = Time.Minute * 83;
const baseCmDuration = Time.Minute * 110;

const { ceil } = Math;
function calcPerc(perc: number, num: number) {
	return ceil(calcPercentOfNum(ceil(perc), num));
}

const itemBoosts = [
	[
		{
			item: getOSItem('Twisted bow'),
			boost: 9
		},
		{
			item: getOSItem('Bow of faerdhinen (c)'),
			boost: 7
		},
		{
			item: getOSItem('Dragon hunter crossbow'),
			boost: 5
		}
	],
	[
		{
			item: getOSItem('Dragon warhammer'),
			boost: 4
		},
		{
			item: getOSItem('Bandos godsword'),
			boost: 2.5
		},
		{
			item: getOSItem('Bandos godsword (or)'),
			boost: 2.5
		}
	]
];

interface ParsedTeamMember {
	id: string;
	kc: number;
	hardKC: number;
	deathChances: TOBDeaths;
	deaths: number[];
}

export async function createTOBTeam({
	team,
	hardMode,
	kcOverride,
	disableVariation
}: {
	team: KlasaUser[];
	hardMode: boolean;
	kcOverride?: [number, number];
	disableVariation?: true;
}): Promise<{
	reductions: Record<string, number>;
	duration: number;
	totalReduction: number;
	parsedTeam: ParsedTeamMember[];
	wipedRoom: TOBRoom | null;
}> {
	const teamSize = team.length;
	assert(teamSize > 1 && teamSize < 6, 'TOB team must be 2-5 users');

	let totalReduction = 0;

	let reductions: Record<string, number> = {};

	let parsedTeam: ParsedTeamMember[] = [];

	for (const u of team) {
		const [kc, hardKC] =
			kcOverride ?? (await Promise.all([u.getMinigameScore('tob'), u.getMinigameScore('tob_hard')]));

		let userPercentChange = 0;

		// Reduce time for gear
		const { total } = calculateTOBUserGearPercents(u);
		userPercentChange += calcPerc(total, speedReductionForGear);

		// Reduce time for KC
		const kcPercent = kcEffectiveness(kc, hardKC, hardMode);
		userPercentChange += calcPerc(kcPercent, speedReductionForKC);

		// Reduce time for item boosts
		for (const boost of itemBoosts) {
			for (const item of boost) {
				if (u.hasItemEquippedOrInBank(item.item.id)) {
					userPercentChange += item.boost;
					break;
				}
			}
		}

		const deathChances = calculateTOBDeaths(kc, hardKC, hardMode);
		parsedTeam.push({ kc, hardKC, deathChances, deaths: deathChances.deaths, id: u.id });

		totalReduction += userPercentChange / teamSize;
		reductions[u.id] = userPercentChange / teamSize;
	}
	let duration = baseDuration;

	if (hardMode) {
		duration = baseCmDuration;
		duration = reduceNumByPercent(duration, totalReduction / 1.3);
	} else {
		duration = reduceNumByPercent(duration, totalReduction);
	}

	if (disableVariation !== true) {
		duration = randomVariation(duration, 5);
	}

	let wipedRoom: TOBRoom | null = null;
	for (let i = 0; i < TOBRooms.length; i++) {
		if (parsedTeam.every(member => member.deaths.includes(i))) {
			wipedRoom = TOBRooms[i];
		}
	}

	return { duration, reductions, totalReduction: totalSpeedReductions / teamSize, parsedTeam, wipedRoom };
}

export async function calcTOBInput(u: KlasaUser) {
	const items = new Bank();
	const kc = await u.getMinigameScore('tob');
	items.add('Stamina potion(4)', 1);
	items.add('Super combat potion(4)', 1);
	items.add('Ranging potion(4)', 1);

	let brewsNeeded = Math.max(1, 8 - Math.max(1, Math.ceil((kc + 1) / 30)));
	const restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));
	if (kc < 20) {
		items.add('Shark', 3);
		items.add('Cooked karambwan', 3);
	}

	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);
	return items;
}
