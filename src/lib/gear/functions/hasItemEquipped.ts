import { GearTypes } from '..';
import getOSItem from '../../util/getOSItem';

export default function hasItemEquipped(item: number, setup: GearTypes.GearSetup) {
	const osItem = getOSItem(item);
	if (!osItem.equipment) return false;
	const itemInSlot = setup[osItem.equipment.slot];
	if (!itemInSlot) return false;
	if (itemInSlot.item === item) {
		return true;
	}
	return false;
}
