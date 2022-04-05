import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Spear: DisassemblySourceGroup = {
	name: 'Spear',
	items: [
		{ item: i('Bone spear'), lvl: 1, partQuantity: 12 },
		{ item: i('Bronze spear'), lvl: 1, partQuantity: 12 },
		{ item: i('Bronze spear(kp)'), lvl: 1, partQuantity: 12 },
		{ item: i('Iron spear(kp)'), lvl: 1, partQuantity: 12 },
		{ item: i('Noose wand'), lvl: 1, partQuantity: 12 },
		{ item: i('Steel spear(kp)'), lvl: 5, partQuantity: 12 },
		{
			item: i('Black spear(kp)'),
			lvl: 10,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 12 }] }
		},
		{ item: i('Iron spear'), lvl: 10, partQuantity: 12 },
		{ item: i('Mithril spear(kp)'), lvl: 20, partQuantity: 12 },
		{ item: i('Steel spear'), lvl: 20, partQuantity: 12 },
		{
			item: i('Black spear'),
			lvl: 25,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 12 }] }
		},
		{ item: i('Mithril spear'), lvl: 30, partQuantity: 12 },
		{ item: i('Rune spear(kp)'), lvl: 40, partQuantity: 12 },
		{ item: i('Rune spear'), lvl: 50, partQuantity: 12 },
		{ item: i('Leaf-bladed spear'), lvl: 55, partQuantity: 12 },
		{ item: i('Dragon spear'), lvl: 60, partQuantity: 12 },
		{ item: i('Dragon spear(kp)'), lvl: 60, partQuantity: 12 },
		{
			item: i("Guthan's warspear"),
			lvl: 70,
			partQuantity: 12,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 12 }] }
		},
		{
			item: i('Zamorakian spear'),
			lvl: 75,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'zamorak', chance: 100, amount: 12 }] }
		},
		{ item: i("Vesta's spear"), lvl: 78, partQuantity: 12 }
	],
	parts: { blade: 30, precise: 3, direct: 2, stave: 35, crafted: 30 }
};

export default Spear;
