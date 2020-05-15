import { GearTypes } from '..';
import getOSItemsArray from '../../util/getOSItemsArray';
import { Item } from 'oldschooljs/dist/meta/types';

export default function hasItemEquipped(item: number, setup: GearTypes.GearSetup) {
	const osItemsArray = getOSItemsArray(item) as Item[];
	for (const osItem of osItemsArray) {
		if (!osItem.equipment) continue;
		const itemInSlot = setup[osItem.equipment.slot];
		if (itemInSlot && itemInSlot.item === item) {
			return true;
		}
	}
	return false;
}
