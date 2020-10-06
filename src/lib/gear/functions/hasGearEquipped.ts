import { objectValues } from 'e';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearTypes } from '..';
import hasItemEquipped from './hasItemEquipped';

export type GearRequired = Partial<
	{
		[key in EquipmentSlot]: number[];
	}
>;

export function hasGearEquipped(setup: GearTypes.GearSetup, reqs: GearRequired): boolean {
	for (const items of objectValues(reqs)) {
		if (!items) continue;

		for (let i = 0; i < items.length; i++) {
			if (hasItemEquipped(items[i], setup)) {
				break;
			} else if (i === items.length - 1) {
				return false;
			}
		}
	}

	return true;
}
