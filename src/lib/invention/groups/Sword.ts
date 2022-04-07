import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Sword: DisassemblySourceGroup = {
	name: 'Sword',
	items: [
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
