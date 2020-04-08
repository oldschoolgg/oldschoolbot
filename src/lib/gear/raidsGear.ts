import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearTypes } from '.';
import { sumOfSetupStats } from './functions/sumOfSetupStats';
import getOSItem from '../util/getOSItem';

function singular(itemName: string): GearTypes.GearSlotItem {
	const item = getOSItem(itemName);
	return {
		item: item.id,
		quantity: 1
	};
}

const minimumMeleeGear: GearTypes.GearStats = sumOfSetupStats({
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: singular("Torag's platebody"),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: singular('Mithril gloves'),
	[EquipmentSlot.Head]: singular('Helm Of Neitiznot'),
	[EquipmentSlot.Legs]: singular("Torag's platelegs"),
	[EquipmentSlot.Neck]: null,
	[EquipmentSlot.Ring]: singular('Warrior ring'),
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: singular('Dragon scimitar')
});

const minimumMageGear: GearTypes.GearStats = sumOfSetupStats({
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: singular("Ahrim's robetop"),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: singular('Mithril gloves'),
	[EquipmentSlot.Head]: null,
	[EquipmentSlot.Legs]: singular("Ahrim's robeskirt"),
	[EquipmentSlot.Neck]: null,
	[EquipmentSlot.Ring]: singular('Seers ring'),
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: singular('Fire battlestaff')
});

const minimumRangeGear: GearTypes.GearStats = sumOfSetupStats({
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: singular("Karil's leathertop"),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: singular('Mithril gloves'),
	[EquipmentSlot.Head]: null,
	[EquipmentSlot.Legs]: singular("Karil's leatherskirt"),
	[EquipmentSlot.Neck]: null,
	[EquipmentSlot.Ring]: singular('Archers ring'),
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: singular('Magic shortbow')
});

export { minimumMeleeGear, minimumMageGear, minimumRangeGear };
