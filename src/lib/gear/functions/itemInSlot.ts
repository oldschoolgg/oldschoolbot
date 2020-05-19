import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';

import { GearTypes } from '..';
import getOSItem from '../../util/getOSItem';

export default function itemInSlot(
	setup: GearTypes.GearSetup,
	slot: EquipmentSlot
): [null, null] | [Item, number] {
	const equipped = setup[slot];
	if (!equipped) return [null, null];
	return [getOSItem(equipped.item), equipped.quantity];
}
