import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Sword: DisassemblySourceGroup = {
	name: 'Sword',
	items: [
		{ item: i('Barb-tail harpoon'), lvl: 1, partQuantity: 8 },
		{
			item: i('Egg whisk'),
			lvl: 1,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'culinary', chance: 100, amount: 8 }] }
		},
		{ item: i('Magic butterfly net'), lvl: 1, partQuantity: 8 },
		{ item: i('Magic secateurs'), lvl: 1, partQuantity: 8 },
		{ item: i('Training sword'), lvl: 1, partQuantity: 8 },
		{
			item: i('Spork'),
			lvl: 10,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'culinary', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black sword'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White sword'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('Kitchen knife'),
			lvl: 40,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'culinary', chance: 100, amount: 8 }] }
		},
		{ item: i('Rapier'), lvl: 40, partQuantity: 8 },
		{ item: i('Leaf-bladed sword'), lvl: 55, partQuantity: 8 },
		{ item: i('Toktz-xil-ak'), lvl: 60, partQuantity: 8 },
		{ item: i('Bronze sword'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron sword'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel sword'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril sword'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune sword'), lvl: 50, partQuantity: 8 }
	],
	parts: { blade: 30, metallic: 30, precise: 3, base: 35, dextrous: 2 }
};

export default Sword;
