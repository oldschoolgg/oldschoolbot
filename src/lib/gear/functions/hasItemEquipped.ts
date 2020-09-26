import { GearTypes } from '..';
import SimilarItems from '../../similarItems';
import getOSItem from '../../util/getOSItem';

export default function hasItemEquipped(item: number, setup: GearTypes.GearSetup) {
	for (const i of [...(SimilarItems[item] ?? []), item]) {
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
