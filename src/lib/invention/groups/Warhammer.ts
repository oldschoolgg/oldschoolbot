import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Warhammer: DisassemblySourceGroup = {
	name: 'Warhammer',
	items: [
		{ item: i('Rat pole'), lvl: 1 },
		{
			item: i('Black warhammer'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White warhammer'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Ivandis flail'), lvl: 31 },
		{ item: i('Granite maul'), lvl: 55 },
		{ item: i('Dragon warhammer'), lvl: 60 },
		{
			item: i("Dharok's greataxe"),
			lvl: 70,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 8 }] }
		},
		{ item: i("Statius's warhammer"), lvl: 78 }
	],
	parts: { strong: 2, head: 30, heavy: 3, base: 35, smooth: 30 },
	partQuantity: 8
};

export default Warhammer;
