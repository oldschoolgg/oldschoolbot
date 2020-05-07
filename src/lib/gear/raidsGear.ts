import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { GearTypes } from '.';
import getOSItem from '../util/getOSItem';

function singular(itemName: string): GearTypes.GearSlotItem {
	const item = getOSItem(itemName);
	return {
		item: item.id,
		quantity: 1
	};
}

const minimumMeleeGear: GearTypes.GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: singular("Torag's platebody"),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: singular('Rune boots'),
	[EquipmentSlot.Hands]: singular('Mithril gloves'),
	[EquipmentSlot.Head]: singular('Helm Of Neitiznot'),
	[EquipmentSlot.Legs]: singular("Torag's platelegs"),
	[EquipmentSlot.Neck]: singular('Amulet of glory'),
	[EquipmentSlot.Ring]: singular('Warrior ring'),
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: singular('Dragon scimitar')
};

const minimumMageGear: GearTypes.GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: singular("Ahrim's robetop"),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: singular('Mithril gloves'),
	[EquipmentSlot.Head]: null,
	[EquipmentSlot.Legs]: singular("Ahrim's robeskirt"),
	[EquipmentSlot.Neck]: singular('Amulet of glory'),
	[EquipmentSlot.Ring]: singular('Seers ring'),
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: singular('Fire battlestaff')
};

const minimumRangeGear: GearTypes.GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: singular("Karil's leathertop"),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: singular('Snakeskin boots'),
	[EquipmentSlot.Hands]: singular('Mithril gloves'),
	[EquipmentSlot.Head]: null,
	[EquipmentSlot.Legs]: singular("Karil's leatherskirt"),
	[EquipmentSlot.Neck]: singular('Amulet of glory'),
	[EquipmentSlot.Ring]: singular('Archers ring'),
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: singular('Magic shortbow')
};

export { minimumMeleeGear, minimumMageGear, minimumRangeGear };
