import { GearTypes } from '../../gear';

import { EquipmentSlot } from 'oldschooljs/dist/meta/types';
import getOSItem from '../../util/getOSItem';

const attackMultipliers = {
	attack: 3,
	strength: 6,
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
		for (const keyToAdd of relevantStats) {
			if (!item.equipment) continue;
			const attackMultiplier = Object.entries(attackMultipliers).find(stat =>
				keyToAdd.includes(stat[0])
			);
			const multiplier = item.weapon
				? 8 - item.weapon['attack_speed']
				: typeof attackMultiplier !== 'undefined'
				? attackMultiplier[1]
				: 1;
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			sum += item.equipment[keyToAdd] * multiplier;
		}
	}

	return sum;
}

export function calcTotalGearScore(gearSets: GearTypes.GearSetup[]): number {
	let sum = 0;
	for (let i = 0; i < 3; i++) {
		sum += gearContribution(gearSets[i], relevantGearStats[i]);
	}
	return sum;
}
