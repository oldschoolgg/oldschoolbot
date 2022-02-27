import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Spear: DisassemblySourceGroup = {
	name: 'Spear',
	items: [
		{ item: i('Bone spear'), lvl: 1 },
		{ item: i('Bronze spear'), lvl: 1 },
		{ item: i('Bronze spear(kp)'), lvl: 1 },
		{ item: i('Iron spear(kp)'), lvl: 1 },
		{ item: i('Noose wand'), lvl: 1 },
		{ item: i('Steel spear(kp)'), lvl: 5 },
		{
			item: i('Black spear(kp)'),
			lvl: 10,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 12 }] }
		},
		{ item: i('Iron spear'), lvl: 10 },
		{ item: i('Mithril spear(kp)'), lvl: 20 },
		{ item: i('Steel spear'), lvl: 20 },
		{
			item: i('Black spear'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 12 }] }
		},
		{ item: i('Mithril spear'), lvl: 30 },
		{ item: i('Rune spear(kp)'), lvl: 40 },
		{ item: i('Rune spear'), lvl: 50 },
		{ item: i('Leaf-bladed spear'), lvl: 55 },
		{ item: i('Dragon spear'), lvl: 60 },
		{ item: i('Dragon spear(kp)'), lvl: 60 },
		{
			item: i("Guthan's warspear"),
			lvl: 70,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 12 }] }
		},
		{
			item: i('Zamorakian spear'),
			lvl: 75,
			special: { always: true, parts: [{ type: 'zamorak', chance: 100, amount: 12 }] }
		},
		{ item: i("Vesta's spear"), lvl: 78 }
	],
	parts: { blade: 30, precise: 3, direct: 2, stave: 35, crafted: 30 },
	partQuantity: 12
};

export default Spear;
