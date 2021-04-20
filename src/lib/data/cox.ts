import { calcPercentOfNum, calcWhatPercent, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { ChambersOfXericOptions } from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { constructGearSetup, GearStats } from '../gear';
import { sumOfSetupStats } from '../gear/functions/sumOfSetupStats';
import { SkillsEnum } from '../skilling/types';
import { Skills } from '../types';
import { skillsMeetRequirements } from '../util';

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

export function createTeam(users: KlasaUser[]): ChambersOfXericOptions['team'] {
	return users.map(u => ({
		id: u.id,
		personalPoints: 1000,
		canReceiveAncientTablet: true,
		canReceiveDust: true
	}));
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

export function checkCoxTeam(users: KlasaUser[]): string | null {
	const hasHerbalist = users.some(u => u.skillLevel(SkillsEnum.Herblore) >= 78);
	if (!hasHerbalist) {
		return 'nobody with atleast level 78 Herblore';
	}
	const hasFarmer = users.some(u => u.skillLevel(SkillsEnum.Farming) >= 55);
	if (!hasFarmer) {
		return 'nobody with atleast level 55 Farming';
	}
	return null;
}

async function kcEffectiveness(u: KlasaUser, challengeMode: boolean) {
	const kc = await u.getMinigameScore(challengeMode ? 'RaidsChallengeMode' : 'Raids');
	const kcEffectiveness = Math.min(100, calcWhatPercent(kc, 400));
	return Math.ceil(kcEffectiveness);
}

const speedReductionForGear = 15;
const speedReductionForKC = 40;
const totalSpeedReductios = speedReductionForGear + speedReductionForKC;
const baseDuration = Time.Minute * 60;
const maxTeamSizeSpeedBoost = 35;

const { ceil } = Math;
function calcPerc(perc: number, num: number) {
	return ceil(calcPercentOfNum(ceil(perc), num));
}

export async function calcCoxDuration(
	team: KlasaUser[],
	challengeMode: boolean
): Promise<{ messages: string[]; duration: number }> {
	let duration = baseDuration;
	const size = team.length;
	let messages = [];

	for (const u of team) {
		let userPercentChange = 0;
		// Reduce time for gear
		const { total } = calculateUserGearPercents(u);
		userPercentChange += ceil(calcPerc(total / size, speedReductionForGear));
		// Reduce time for KC

		const kcPercent = ceil(await kcEffectiveness(u, challengeMode));
		console.log(
			kcPercent,
			ceil(kcPercent / size),
			speedReductionForKC,
			calcPerc(ceil(kcPercent / size), speedReductionForKC)
		);
		userPercentChange += ceil(calcPerc(ceil(kcPercent / size), speedReductionForKC));
		// userPercentChange += ceil(
		// 	calcPerc(userPercentChange / (totalSpeedReductios / 10), maxTeamSizeSpeedBoost)
		// );
		console.log({ userPercentChange });
		duration = reduceNumByPercent(duration, ceil(userPercentChange));
		messages.push(
			`${userPercentChange.toFixed(1)}%/${(totalSpeedReductios / size).toFixed(2)}% from ${
				u.username
			}`
		);
	}

	return { duration, messages };
}
