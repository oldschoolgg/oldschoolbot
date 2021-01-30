import { GearTypes } from '..';
import { getSimilarItems } from '../../data/similarItems';
import getOSItem from '../../util/getOSItem';

export default function hasItemEquipped(item: number, setup: GearTypes.GearSetup) {
	for (const i of getSimilarItems(item)) {
		const osItem = getOSItem(i);
		if (!osItem.equipment) return false;
		const itemInSlot = setup[osItem.equipment.slot];
		if (!itemInSlot) return false;
		if (itemInSlot.item === i) {
			return true;
		}
	}
	return false;
}
