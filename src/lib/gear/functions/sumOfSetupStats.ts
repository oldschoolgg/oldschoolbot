import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearTypes } from '..';
import getOSItem from '../../util/getOSItem';

const baseSumObj: GearTypes.GearStats = {
	attack_stab: 0,
	attack_slash: 0,
	attack_crush: 0,
	attack_magic: 0,
	attack_ranged: 0,
	defence_stab: 0,
	defence_slash: 0,
	defence_crush: 0,
	defence_magic: 0,
	defence_ranged: 0,
	melee_strength: 0,
	ranged_strength: 0,
	magic_damage: 0,
	prayer: 0
};

export function sumOfSetupStats(setup: GearTypes.GearSetup): GearTypes.GearStats {
	const sum = { ...baseSumObj };

	// For each item slot that there is...
	for (const key of Object.values(EquipmentSlot) as EquipmentSlot[]) {
		// Get the item equipped in that slot...
		const itemSlot = setup[key];
		if (!itemSlot) continue;
		const item = getOSItem(itemSlot.item);
		for (const keyToAdd of Object.keys(baseSumObj)) {
			if (!item.equipment) continue;
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			sum[keyToAdd] += item.equipment[keyToAdd];
		}
	}

	return sum;
}
