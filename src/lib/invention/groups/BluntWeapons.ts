import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const BluntWeapons: DisassemblySourceGroup = {
	name: 'Blunt Weapons',
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
		{ item: i('Dragon warhammer'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i("Statius's warhammer"), lvl: 78 },
		{ item: i('Bronze warhammer'), lvl: 1 },
		{ item: i('Iron warhammer'), lvl: 10 },
		{ item: i('Steel warhammer'), lvl: 20 },
		{ item: i('Mithril warhammer'), lvl: 30 },
		{ item: i('Adamant warhammer'), lvl: 40 },
		{ item: i('Rune warhammer'), lvl: 50 },
		{ item: i('Tzhaar-ket-om'), lvl: 60 },
		{ item: i('Elder maul'), lvl: 90 },
		{ item: i('Abyssal bludgeon'), lvl: 90 }
	],
	parts: { strong: 10, heavy: 10, base: 15, smooth: 30 }
};
