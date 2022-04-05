import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Warhammer: DisassemblySourceGroup = {
	name: 'Warhammer',
	items: [
		{ item: i('Rat pole'), lvl: 1, partQuantity: 8 },
		{
			item: i('Black warhammer'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White warhammer'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Ivandis flail'), lvl: 31, partQuantity: 8 },
		{ item: i('Granite maul'), lvl: 55, partQuantity: 8 },
		{ item: i('Dragon warhammer'), lvl: 60, partQuantity: 8 },
		{
			item: i("Dharok's greataxe"),
			lvl: 70,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{ item: i("Statius's warhammer"), lvl: 78, partQuantity: 8 },
		{ item: i('Bronze warhammer'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron warhammer'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel warhammer'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril warhammer'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune warhammer'), lvl: 50, partQuantity: 8 }
	],
	parts: { strong: 2, head: 30, heavy: 3, base: 35, smooth: 30 }
};

export default Warhammer;
