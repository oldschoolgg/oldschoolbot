import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Battleaxe: DisassemblySourceGroup = {
	name: 'Battleaxe',
	items: [
		{ item: i('Bronze battleaxe'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron battleaxe'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel battleaxe'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril battleaxe'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune battleaxe'), lvl: 50, partQuantity: 8 },
		{
			item: i('Black battleaxe'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White battleaxe'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Dragon battleaxe'), lvl: 60, partQuantity: 8 }
	],
	parts: { blade: 30, head: 35, direct: 2, sharp: 3, smooth: 30 }
};

export default Battleaxe;
