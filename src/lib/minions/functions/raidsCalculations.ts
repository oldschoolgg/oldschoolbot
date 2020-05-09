import { GearTypes } from '../../gear';

import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import getOSItem from '../../util/getOSItem';
import { sumOfSetupStats } from '../../gear/functions/sumOfSetupStats';
import { minimumMeleeGear, minimumMageGear, minimumRangeGear } from '../../gear/raidsGear';

const statMultipliers = {
	prayer: 1,
	attack: 5,
	strength: 7,
	damage: 10
};

const relevantMeleeStats = [
	'defence_stab',
	'defence_slash',
	'defence_crush',
	'defence_magic',
	'defence_ranged',
	'melee_strength',
	'prayer'
];

const relevantRangeStats = [
	'attack_ranged',
	'defence_stab',
	'defence_slash',
	'defence_crush',
	'defence_magic',
	'defence_ranged',
	'ranged_strength',
	'prayer'
];

const relevantMageStats = [
	'attack_magic',
	'defence_stab',
	'defence_slash',
	'defence_crush',
	'defence_magic',
	'defence_ranged',
	'magic_damage',
	'prayer'
];

function gearContribution(setup: GearTypes.GearSetup, relevantStats: string[]): number {
	let sum = 0;

	for (const key of Object.values(EquipmentSlot) as EquipmentSlot[]) {
		// Get the item equipped in that slot...
		const itemSlot = setup[key];
		if (!itemSlot) continue;
		const item = getOSItem(itemSlot.item);
		if (!item.equipment) continue;
		// Only try to add the stats we care about for each style
		for (const statToAdd of relevantStats) {
			// If the stat has a multiplier get it
			const statsMultiplier = Object.entries(statMultipliers).find(stat =>
				statToAdd.includes(stat[0])
			);

			// Set stat multiplier to the found multiplier or default 0.5 if it has none
			const statMultiplier =
				typeof statsMultiplier !== 'undefined' ? statsMultiplier[1] : 0.5;

			// If the item is a weapon set the multiplier to 8 - weapon speed (speed in value of ticks per attack) lower is faster
			const multiplier = item.weapon
				? (8 - item.weapon['attack_speed']) * statMultiplier
				: statMultiplier;

			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			sum += Math.floor(item.equipment[statToAdd] * multiplier);
		}
	}

	return sum;
}

export function getMeleeContribution(setup: GearTypes.GearSetup): number {
	const statsSum = sumOfSetupStats(setup);
	// find the highest of the attack stats and only count that as relevant
	const stat =
		statsSum.attack_stab >= statsSum.attack_slash &&
		statsSum.attack_stab >= statsSum.attack_crush
			? 'attack_stab'
			: statsSum.attack_slash >= statsSum.attack_crush
			? 'attack_slash'
			: 'attack_crush';
	return gearContribution(setup, relevantMeleeStats.concat([stat]));
}

export function getRangeContribution(setup: GearTypes.GearSetup): number {
	return gearContribution(setup, relevantRangeStats);
}

export function getMageContribution(setup: GearTypes.GearSetup): number {
	return gearContribution(setup, relevantMageStats);
}

// TODO: fix this maybe
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export function calcTotalGearScore(gearSets): number {
	return (
		getMeleeContribution(gearSets.meleeGear) +
		getMageContribution(gearSets.mageGear) +
		getRangeContribution(gearSets.rangeGear)
	);
}

// TODO: fix this maybe
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export function getGearMultiplier(gearSets): number {
	const userGearScore = calcTotalGearScore(gearSets);
	const BASE_GEAR_SCORE = calcTotalGearScore({
		meleeGear: minimumMeleeGear,
		mageGear: minimumMageGear,
		rangeGear: minimumRangeGear
	});
	// 3 * difference between user gear and base gear to accentuate the gear difference
	return Math.min(2, (3 * (userGearScore - BASE_GEAR_SCORE)) / BASE_GEAR_SCORE);
}

export function getKcMultiplier(kc: number): number {
	// log base 30 of kc: returns 1 with kc 30 and 2 with kc 900
	return Math.min(2, Math.log(kc) / Math.log(30));
}
