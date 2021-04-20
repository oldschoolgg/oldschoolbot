import { calcWhatPercent } from 'e';
import { KlasaUser } from 'klasa';
import { ChambersOfXericOptions } from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { constructGearSetup, GearStats } from '../gear';
import { sumOfSetupStats } from '../gear/functions/sumOfSetupStats';
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

export const bareMinSoloStats: Skills = {
	...bareMinStats,
	farming: 55,
	herblore: 78
};

export function hasMinRaidsRequirements(user: KlasaUser, solo: boolean) {
	return skillsMeetRequirements(user.rawSkills, solo ? bareMinSoloStats : bareMinStats);
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
	return {
		melee: calcSetupPercent(
			maxMeleeSum,
			sumOfSetupStats(user.getGear('melee')),
			'melee_strength'
		),
		range: calcSetupPercent(
			maxRangeSum,
			sumOfSetupStats(user.getGear('range')),
			'ranged_strength'
		),
		mage: calcSetupPercent(maxMageSum, sumOfSetupStats(user.getGear('mage')), 'magic_damage')
	};
}
