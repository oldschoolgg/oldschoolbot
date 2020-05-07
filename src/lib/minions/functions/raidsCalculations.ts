import { GearTypes } from '../../gear';

import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import getOSItem from '../../util/getOSItem';

const attackStyleMultipliers = {
	attack: 5,
	strength: 7,
	damage: 10
};

const relevantMeleeStats = [
	'attack_stab',
	'attack_slash',
	'attack_crush',
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

const relevantMagicStats = [
	'attack_magic',
	'defence_stab',
	'defence_slash',
	'defence_crush',
	'defence_magic',
	'defence_ranged',
	'magic_damage',
	'prayer'
];

const relevantGearStats = [relevantMeleeStats, relevantRangeStats, relevantMagicStats];

function gearContribution(setup: GearTypes.GearSetup, relevantStats: string[]): number {
	let sum = 0;

	for (const key of Object.values(EquipmentSlot) as EquipmentSlot[]) {
		// Get the item equipped in that slot...
		const itemSlot = setup[key];
		if (!itemSlot) continue;
		const item = getOSItem(itemSlot.item);
		if (!item.equipment) continue;
		// Only try to add the stats we care about for each style
		for (const keyToAdd of relevantStats) {
			// If the stat is an attack stat get that multiplier
			const attackStyleMultiplier = Object.entries(attackStyleMultipliers).find(stat =>
				keyToAdd.includes(stat[0])
			);

			// Set attack multiplier to thefound multiplier or 0.5 if its not an attack style
			const attackMultiplier =
				typeof attackStyleMultiplier !== 'undefined' ? attackStyleMultiplier[1] : 0.5;

			// If the item is set the multiplier to 8 - weapon speed (speed in value of ticks per attack) lower is faster
			const multiplier = item.weapon
				? 8 - item.weapon['attack_speed'] + attackMultiplier
				: attackMultiplier;
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			sum += Math.floor(item.equipment[keyToAdd] * multiplier);
		}
	}

	return sum;
}

export function calcTotalGearScore(gearSets: GearTypes.GearSetup[]): number {
	let sum = 0;
	for (let i = 0; i < 3; i++) {
		console.log(gearContribution(gearSets[i], relevantGearStats[i]));
		sum += gearContribution(gearSets[i], relevantGearStats[i]);
	}
	return sum;
}
