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
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: singular('Mithril gloves'),
	[EquipmentSlot.Head]: singular('Helm Of Neitiznot'),
	[EquipmentSlot.Legs]: singular("Torag's platelegs"),
	[EquipmentSlot.Neck]: singular('Amulet of power'),
	[EquipmentSlot.Ring]: null,
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: singular('Dragon scimitar')
};

const minimumMageGear: GearTypes.GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: singular('Mystic robetop'),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: singular('Mystic boots'),
	[EquipmentSlot.Hands]: singular('Mithril gloves'),
	[EquipmentSlot.Head]: null,
	[EquipmentSlot.Legs]: singular('Mystic robe bottom'),
	[EquipmentSlot.Neck]: singular('Amulet of power'),
	[EquipmentSlot.Ring]: null,
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: singular('Fire battlestaff')
};

const minimumRangeGear: GearTypes.GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: singular('Steel arrow'),
	[EquipmentSlot.Body]: singular("Black d'hide body"),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: singular('Mithril gloves'),
	[EquipmentSlot.Head]: null,
	[EquipmentSlot.Legs]: singular("Black d'hide chaps"),
	[EquipmentSlot.Neck]: singular('Amulet of power'),
	[EquipmentSlot.Ring]: null,
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: singular('Magic shortbow')
};

const testMeleeGear: GearTypes.GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: singular('Bandos chestplate'),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: singular('Barrows gloves'),
	[EquipmentSlot.Head]: singular('Helm Of Neitiznot'),
	[EquipmentSlot.Legs]: singular('Bandos Tassets'),
	[EquipmentSlot.Neck]: singular('Amulet of glory'),
	[EquipmentSlot.Ring]: singular('Berserker ring'),
	[EquipmentSlot.Shield]: singular('Dragon defender'),
	[EquipmentSlot.Weapon]: singular('Abyssal whip')
};

const testMageGear: GearTypes.GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: singular("Ahrim's robetop"),
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: singular('Wizard boots'),
	[EquipmentSlot.Hands]: singular('Barrows gloves'),
	[EquipmentSlot.Head]: singular("Ahrim's hood"),
	[EquipmentSlot.Legs]: singular("Ahrim's robeskirt"),
	[EquipmentSlot.Neck]: singular('amulet of glory'),
	[EquipmentSlot.Ring]: singular('Seers ring'),
	[EquipmentSlot.Shield]: singular(`Malediction ward`),
	[EquipmentSlot.Weapon]: singular('Toxic staff of the dead')
};

const testRangeGear: GearTypes.GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: singular('Dragon bolts'),
	[EquipmentSlot.Body]: singular('Armadyl chestplate'),
	[EquipmentSlot.Cape]: singular(`Ava's assembler`),
	[EquipmentSlot.Feet]: singular('Ranger boots'),
	[EquipmentSlot.Hands]: singular('Barrows gloves'),
	[EquipmentSlot.Head]: singular('Armadyl helmet'),
	[EquipmentSlot.Legs]: singular('Armadyl chainskirt'),
	[EquipmentSlot.Neck]: singular('amulet of glory'),
	[EquipmentSlot.Ring]: singular('Archers ring'),
	[EquipmentSlot.Shield]: singular('Odium ward'),
	[EquipmentSlot.Weapon]: singular('Armadyl crossbow')
};

export {
	minimumMeleeGear,
	minimumMageGear,
	minimumRangeGear,
	testMeleeGear,
	testMageGear,
	testRangeGear
};
