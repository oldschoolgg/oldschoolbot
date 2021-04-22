import {
	calcPercentOfNum,
	calcWhatPercent,
	increaseNumByPercent,
	percentChance,
	randInt,
	reduceNumByPercent,
	shuffleArr,
	Time
} from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { ChambersOfXericOptions } from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { constructGearSetup, GearStats } from '../gear';
import { sumOfSetupStats } from '../gear/functions/sumOfSetupStats';
import { SkillsEnum } from '../skilling/types';
import { Skills } from '../types';
import { randomVariation, skillsMeetRequirements } from '../util';
import getOSItem from '../util/getOSItem';

export const bareMinStats: Skills = {
	attack: 80,
	strength: 80,
	defence: 80,
	ranged: 80,
	magic: 80,
	prayer: 70
};

export function hasMinRaidsRequirements(user: KlasaUser) {
	return skillsMeetRequirements(user.rawSkills, bareMinStats);
}

function kcPointsEffect(kc: number) {
	if (kc < 5) return -70;
	if (kc < 10) return -40;
	if (kc < 15) return -25;
	if (kc < 25) return -10;
	if (kc < 50) return -5;
	if (kc > 100) return 10;
	if (kc > 150) return 20;
	if (kc < 200) return 25;
	return 30;
}

// function getBaseDeathChance(kc: number, base) {}

export async function createTeam(
	users: KlasaUser[],
	cm: boolean
): Promise<Array<{ died: boolean; deathChance: number } & ChambersOfXericOptions['team'][0]>> {
	let res = [];
	for (const u of users) {
		let points = 24_000;
		const { total } = calculateUserGearPercents(u);
		let deathChance = 20;
		if (total < 30) {
			points = 1_000;
			deathChance += 20;
		} else if (total < 50) {
			points = 5_000;
			deathChance += 10;
		} else {
			points = increaseNumByPercent(points, total / 10);
			deathChance -= calcPercentOfNum(total, 10);
		}

		const kc = await u.getMinigameScore(cm ? 'RaidsChallengeMode' : 'Raids');
		const kcChange = kcPointsEffect(kc);
		if (kcChange < 0) points = reduceNumByPercent(points, kcChange);
		else points = increaseNumByPercent(points, kcChange);

		const kcPercent = Math.min(100, calcWhatPercent(kc, 100));
		if (kc < 30) deathChance += Math.max(0, 30 - kc);
		deathChance -= calcPercentOfNum(kcPercent, 10);

		if (users.length > 1) {
			points -= Math.min(6, Math.max(3, users.length)) * 1600;
		} else {
			deathChance += 5;
		}

		if (cm) deathChance *= 2;
		deathChance += 1;

		let died = false;
		for (let i = 0; i < randInt(1, 3); i++) {
			if (percentChance(deathChance)) {
				points = reduceNumByPercent(points, 40);
				died = true;
			}
		}

		points = Math.floor(points);

		const bank = u.bank();
		res.push({
			id: u.id,
			personalPoints: points,
			canReceiveAncientTablet: bank.has('Ancient tablet'),
			canReceiveDust: bank.has('Metamorphic dust'),
			died,
			deathChance
		});
	}
	return res;
}

function calcSetupPercent(
	maxStats: GearStats,
	userStats: GearStats,
	heavyPenalizeStat: keyof GearStats
) {
	let numKeys = Object.values(maxStats).filter(i => i > 0).length;
	let totalPercent = 0;
	for (const [key, val] of Object.entries(maxStats) as [keyof GearStats, number][]) {
		if (val <= 0) continue;
		const rawPercent = Math.min(100, calcWhatPercent(userStats[key], val));
		totalPercent += rawPercent / numKeys;
	}
	// Heavy penalize for having less than 50% in the main stat of this setup.
	if (userStats[heavyPenalizeStat] < maxStats[heavyPenalizeStat]) {
		totalPercent = Math.floor(Math.max(0, totalPercent / 2));
	}
	return totalPercent;
}

export const maxMageGear = constructGearSetup({
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
const maxMageSum = sumOfSetupStats(maxMageGear);

export const maxRangeGear = constructGearSetup({
	head: 'Armadyl helmet',
	neck: 'Necklace of anguish',
	body: 'Armadyl chestplate',
	cape: "Ava's assembler",
	hands: 'Barrows gloves',
	legs: 'Armadyl chainskirt',
	feet: 'Pegasian boots',
	weapon: 'Twisted bow',
	ring: 'Archers ring(i)',
	ammo: 'Dragon arrow'
});
const maxRangeSum = sumOfSetupStats(maxRangeGear);

export const maxMeleeGear = constructGearSetup({
	head: 'Neitiznot faceguard',
	neck: 'Amulet of torture',
	body: 'bandos chestplate',
	cape: 'Infernal cape',
	hands: 'Ferocious gloves',
	legs: 'Bandos tassets',
	feet: 'Primordial boots',
	weapon: 'Scythe of vitur',
	ring: 'Berserker ring(i)'
});
const maxMeleeSum = sumOfSetupStats(maxMeleeGear);

export function calculateUserGearPercents(user: KlasaUser) {
	const melee = calcSetupPercent(
		maxMeleeSum,
		sumOfSetupStats(user.getGear('melee')),
		'melee_strength'
	);
	const range = calcSetupPercent(
		maxRangeSum,
		sumOfSetupStats(user.getGear('range')),
		'ranged_strength'
	);
	const mage = calcSetupPercent(
		maxMageSum,
		sumOfSetupStats(user.getGear('mage')),
		'magic_damage'
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

export function checkCoxTeam(users: KlasaUser[]): string | null {
	const hasHerbalist = users.some(u => u.skillLevel(SkillsEnum.Herblore) >= 78);
	if (!hasHerbalist) {
		return 'nobody with atleast level 78 Herblore';
	}
	const hasFarmer = users.some(u => u.skillLevel(SkillsEnum.Farming) >= 55);
	if (!hasFarmer) {
		return 'nobody with atleast level 55 Farming';
	}
	const userWithoutSupplies = users.find(u => !u.owns(minimumCoxSuppliesNeeded));
	if (userWithoutSupplies) {
		return `${userWithoutSupplies.username} doesn't have enough supplies`;
	}
	return null;
}

async function kcEffectiveness(u: KlasaUser, challengeMode: boolean) {
	const kc = await u.getMinigameScore(challengeMode ? 'RaidsChallengeMode' : 'Raids');
	const kcEffectiveness = Math.min(100, calcWhatPercent(kc, 400));
	return kcEffectiveness;
}

const speedReductionForGear = 15;
const speedReductionForKC = 40;
const totalSpeedReductios = speedReductionForGear + speedReductionForKC;
const baseDuration = Time.Minute * 83;

const { ceil } = Math;
function calcPerc(perc: number, num: number) {
	return ceil(calcPercentOfNum(ceil(perc), num));
}

function teamSizeBoostPercent(size: number) {
	switch (size) {
		case 1:
			return -10;
		case 2:
			return 12;
		case 3:
			return 13;
		case 4:
			return 18;
		case 5:
			return 23;
		case 6:
			return 26;
		case 7:
			return 29;
		case 8:
			return 33;
		default:
			return 35;
	}
}

if (teamSizeBoostPercent(9) !== teamSizeBoostPercent(11)) {
	throw new Error('WTFFFFFFFFFFFFFF');
}

const itemBoosts = [
	{
		item: getOSItem('Twisted bow'),
		boost: 10
	},
	{
		item: getOSItem('Dragon warhammer'),
		boost: 5
	}
];

export async function calcCoxDuration(
	_team: KlasaUser[],
	challengeMode: boolean
): Promise<{ messages: string[]; duration: number }> {
	const team = shuffleArr(_team).slice(0, 9);
	const size = team.length;
	let messages = [];

	let totalReduction = 0;

	for (const u of team) {
		let userPercentChange = 0;

		// Reduce time for gear
		const { total } = calculateUserGearPercents(u);
		userPercentChange += calcPerc(total, speedReductionForGear);

		// Reduce time for KC
		const kcPercent = await kcEffectiveness(u, challengeMode);
		userPercentChange += calcPerc(kcPercent, speedReductionForKC);

		// Reduce time for item boosts
		for (const item of itemBoosts) {
			if (u.hasItemEquippedOrInBank(item.item.id)) {
				userPercentChange += item.boost;
			}
		}

		totalReduction += userPercentChange / size;
		messages.push(
			`${userPercentChange.toFixed(1)}%/${(totalSpeedReductios / size).toFixed(2)}% from ${
				u.username
			}`
		);
	}
	let duration = baseDuration;

	duration = reduceNumByPercent(duration, totalReduction);
	duration -= duration * (teamSizeBoostPercent(size) / 100);
	if (challengeMode) {
		duration *= 2;
	}
	duration = randomVariation(duration, 5);
	return { duration, messages };
}

export async function calcCoxInput(u: KlasaUser, solo: boolean) {
	const items = new Bank();
	const kc = await u.getMinigameScore('Raids');
	if (solo) {
		items.add('Stamina potion(4)', 3);
	} else {
		items.add('Stamina potion(4)', kc > 100 ? 1 : 2);
	}

	let brewsNeeded = 8 - Math.max(1, Math.ceil(kc / 100));
	if (solo) brewsNeeded++;
	const restoresNeeded = Math.floor(brewsNeeded / 3);
	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);
	return items;
}
