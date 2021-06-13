import { captureMessage } from '@sentry/minimal';
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
import { SkillsEnum } from '../skilling/types';
import { Gear } from '../structures/Gear';
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
	if (kc < 100) return 10;
	if (kc < 150) return 20;
	if (kc < 200) return 25;
	return 30;
}

export async function createTeam(
	users: KlasaUser[],
	cm: boolean
): Promise<
	Array<
		{
			deaths: number;
			deathChance: number;
		} & ChambersOfXericOptions['team'][0]
	>
> {
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
		if (kcChange < 0) points = reduceNumByPercent(points, Math.abs(kcChange));
		else points = increaseNumByPercent(points, kcChange);

		const kcPercent = Math.min(100, calcWhatPercent(kc, 100));
		if (kc < 30) deathChance += Math.max(0, 30 - kc);
		deathChance -= calcPercentOfNum(kcPercent, 10);

		if (users.length > 1) {
			points -=
				Math.min(6, Math.max(3, users.length)) *
				Math.min(1600, calcPercentOfNum(15, points));
		} else {
			deathChance += 5;
		}

		if (cm) {
			deathChance *= 2;
			points = increaseNumByPercent(points, 40);
		}
		deathChance += 1;

		if (cm && kc > 20) {
			points += 5000;
		}

		let deaths = 0;
		for (let i = 0; i < randInt(1, 3); i++) {
			if (percentChance(deathChance)) {
				points = reduceNumByPercent(points, randInt(36, 44));
				++deaths;
			}
		}

		points = Math.floor(randomVariation(points, 5));
		if (points < 1 || points > 60_000) {
			captureMessage(`${u.username} had ${points} points in a team of ${users.length}.`);
			points = 10_000;
		}

		const bank = u.bank();
		res.push({
			id: u.id,
			personalPoints: points,
			canReceiveAncientTablet: !bank.has('Ancient tablet'),
			canReceiveDust: true,
			deaths,
			deathChance
		});
	}
	return res;
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
const maxMage = new Gear(maxMageGear);

export const maxRangeGear = constructGearSetup({
	head: 'Armadyl helmet',
	neck: 'Necklace of anguish',
	body: 'Armadyl chestplate',
	cape: "Ava's assembler",
	hands: 'Barrows gloves',
	legs: 'Armadyl chainskirt',
	feet: 'Pegasian boots',
	'2h': 'Twisted bow',
	ring: 'Archers ring(i)',
	ammo: 'Dragon arrow'
});
const maxRange = new Gear(maxRangeGear);

export const maxMeleeGear = constructGearSetup({
	head: "Inquisitor's great helm",
	neck: 'Amulet of torture',
	body: "Inquisitor's hauberk",
	cape: 'Fire cape',
	hands: 'Ferocious gloves',
	legs: "Inquisitor's plateskirt",
	feet: 'Primordial boots',
	weapon: "Inquisitor's mace",
	shield: 'Dragon defender',
	ring: 'Berserker ring(i)'
});
const maxMelee = new Gear(maxMeleeGear);

export function calculateUserGearPercents(user: KlasaUser) {
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

export async function checkCoxTeam(users: KlasaUser[], cm: boolean): Promise<string | null> {
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

	for (const user of users) {
		const { total } = calculateUserGearPercents(user);
		if (total < 20) {
			return `Your gear is terrible! You do not stand a chance in the Chamber's of Xeric.`;
		}
		if (!hasMinRaidsRequirements(user)) {
			return `${user.username} doesn't meet the stat requirements to do the Chamber's of Xeric.`;
		}
		if (cm) {
			if (users.length === 1 && !user.hasItemEquippedOrInBank('Twisted bow')) {
				return `${user.username} doesn't own a Twisted bow, which is required for solo Challenge Mode.`;
			}
			if (
				users.length > 1 &&
				!user.hasItemEquippedOrInBank('Dragon hunter crossbow') &&
				!user.hasItemEquippedOrInBank('Twisted bow')
			) {
				return `${user.username} doesn't own a Twisted bow or Dragon hunter crossbow, which is required for Challenge Mode.`;
			}
			const kc = await user.getMinigameScore('Raids');
			if (kc < 200) {
				return `${user.username} doesn't have the 200 KC required for Challenge Mode.`;
			}
		}
		if (user.minionIsBusy) {
			return `${user.username}'s minion is already doing an activity and cannot join.`;
		}
	}

	return null;
}

async function kcEffectiveness(u: KlasaUser, challengeMode: boolean, isSolo: boolean) {
	const kc = await u.getMinigameScore(challengeMode ? 'RaidsChallengeMode' : 'Raids');
	let cap = isSolo ? 250 : 400;
	if (challengeMode) {
		cap = isSolo ? 75 : 100;
	}
	const kcEffectiveness = Math.min(100, calcWhatPercent(kc, cap));
	return kcEffectiveness;
}

const speedReductionForGear = 15;
const speedReductionForKC = 40;
const totalSpeedReductions = speedReductionForGear + speedReductionForKC + 10 + 5;
const baseDuration = Time.Minute * 83;
const baseCmDuration = Time.Minute * 110;

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

const itemBoosts = [
	[
		{
			item: getOSItem('Twisted bow'),
			boost: 10
		},
		{
			item: getOSItem('Dragon hunter crossbow'),
			boost: 5
		}
	],
	[
		{
			item: getOSItem('Dragon warhammer'),
			boost: 5
		},
		{
			item: getOSItem('Bandos godsword'),
			boost: 2.5
		},
		{
			item: getOSItem('Bandos godsword (or)'),
			boost: 2.5
		}
	],
	[
		{
			item: getOSItem('Dragon hunter lance'),
			boost: 5
		}
	]
];

export async function calcCoxDuration(
	_team: KlasaUser[],
	challengeMode: boolean
): Promise<{
	reductions: Record<string, number>;
	duration: number;
	totalReduction: number;
}> {
	const team = shuffleArr(_team).slice(0, 9);
	const size = team.length;

	let totalReduction = 0;

	let reductions: Record<string, number> = {};

	for (const u of team) {
		let userPercentChange = 0;

		// Reduce time for gear
		const { total } = calculateUserGearPercents(u);
		userPercentChange += calcPerc(total, speedReductionForGear);

		// Reduce time for KC
		const kcPercent = await kcEffectiveness(u, challengeMode, team.length === 1);
		userPercentChange += calcPerc(kcPercent, speedReductionForKC);

		// Reduce time for item boosts
		itemBoosts.forEach(set => {
			for (const item of set) {
				if (u.hasItemEquippedOrInBank(item.item.id)) {
					userPercentChange += item.boost;
					break;
				}
			}
		});

		totalReduction += userPercentChange / size;
		reductions[u.id] = userPercentChange / size;
	}
	let duration = baseDuration;

	if (challengeMode) {
		duration = baseCmDuration;
		duration = reduceNumByPercent(duration, totalReduction / 1.3);
	} else {
		duration = reduceNumByPercent(duration, totalReduction);
	}

	duration -= duration * (teamSizeBoostPercent(size) / 100);

	duration = randomVariation(duration, 5);
	return {
		duration,
		reductions,
		totalReduction: totalSpeedReductions / size
	};
}

export async function calcCoxInput(u: KlasaUser, solo: boolean) {
	const items = new Bank();
	const kc = await u.getMinigameScore('Raids');
	items.add('Stamina potion(4)', solo ? 2 : 1);

	let brewsNeeded = Math.max(1, 8 - Math.max(1, Math.ceil((kc + 1) / 30)));
	if (solo) brewsNeeded++;
	const restoresNeeded = Math.max(1, Math.floor(brewsNeeded / 3));

	items.add('Saradomin brew(4)', brewsNeeded);
	items.add('Super restore(4)', restoresNeeded);
	return items;
}
