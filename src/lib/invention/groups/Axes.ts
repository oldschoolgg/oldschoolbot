import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Axes: DisassemblySourceGroup = {
	name: 'Axes',
	items: [
		{ item: i('Bronze pickaxe'), lvl: 1 },
		{ item: i('Iron pickaxe'), lvl: 10 },
		{ item: i('Steel pickaxe'), lvl: 20 },
		{ item: i('Mithril pickaxe'), lvl: 30 },
		{ item: i('Rune pickaxe'), lvl: 50 },
		{ item: i('Dragon pickaxe'), lvl: 60 },
		{
			item: i('Crystal pickaxe'),
			lvl: 71,

			special: {
				always: true,
				parts: [{ type: 'crystal', chance: 74, amount: 8 }]
			}
		},
		{ item: i('3rd age pickaxe'), lvl: 60, flags: ['third_age'] },
		// Axes
		{ item: i('Bronze axe'), lvl: 1 },
		{ item: i('Iron axe'), lvl: 1 },
		{ item: i('Steel axe'), lvl: 6 },
		{ item: i('Black axe'), lvl: 10 },
		{ item: i('Mithril axe'), lvl: 21 },
		{ item: i('Adamant axe'), lvl: 31 },
		{ item: i('Rune axe'), lvl: 41 },
		{ item: i('Gilded axe'), lvl: 61 },
		{ item: i('Dragon axe'), lvl: 61 },
		{ item: i('3rd age axe'), lvl: 60, flags: ['third_age'] },
		{ item: i('Crystal axe'), lvl: 61 }
	],
	parts: { heavy: 3, base: 35, sharp: 30 }
};
