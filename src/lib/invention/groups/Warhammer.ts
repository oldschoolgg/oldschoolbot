import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Warhammer: DisassemblySourceGroup = {
	name: 'Warhammer',
	items: [
		{
			item: i('Black warhammer'),
			lvl: 25
		},
		{
			item: i('White warhammer'),
			lvl: 25
		},
		{ item: i('Granite maul'), lvl: 55 },
		{ item: i('Dragon warhammer'), lvl: 60 },
		{
			item: i("Dharok's greataxe"),
			lvl: 70
		},
		{ item: i("Statius's warhammer"), lvl: 78 },
		{ item: i('Bronze warhammer'), lvl: 1 },
		{ item: i('Iron warhammer'), lvl: 10 },
		{ item: i('Steel warhammer'), lvl: 20 },
		{ item: i('Mithril warhammer'), lvl: 30 },
		{ item: i('Rune warhammer'), lvl: 50 },
		{ item: i('Dwarven warhammer'), lvl: 99, flags: new Set(['dwarven']) },
		{ item: i('Dwarven warnana'), lvl: 99, flags: new Set(['dwarven', 'dyed']) }
	],
	parts: { strong: 2, heavy: 3, base: 35, smooth: 30 }
};
