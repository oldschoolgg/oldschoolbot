import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Axes: DisassemblySourceGroup = {
	name: 'Axes',
	items: [
		{ item: i('Bronze pickaxe'), lvl: 1 },
		{ item: i('Iron pickaxe'), lvl: 10 },
		{ item: i('Iron thrownaxe'), lvl: 10 },
		{ item: i('Steel pickaxe'), lvl: 20 },
		{ item: i('Steel thrownaxe'), lvl: 20 },
		{ item: i('Mithril pickaxe'), lvl: 30 },
		{ item: i('Mithril thrownaxe'), lvl: 30 },
		{ item: i('Adamant pickaxe'), lvl: 50 },
		{ item: i('Adamant thrownaxe'), lvl: 30 },
		{ item: i('Rune pickaxe'), lvl: 50 },
		{ item: i('Rune thrownaxe'), lvl: 30 },
		{ item: i('Dragon pickaxe'), lvl: 60 },
		{
			item: i('Crystal pickaxe'),
			lvl: 71
		},
		{ item: i('3rd age pickaxe'), lvl: 60, flags: new Set(['third_age']) },
		// Axes
		{ item: i('Bronze axe'), lvl: 1 },
		{ item: i('Bronze battleaxe'), lvl: 1 },
		{ item: i('Iron battleaxe'), lvl: 10 },
		{ item: i('Iron axe'), lvl: 1 },
		{ item: i('Steel axe'), lvl: 6 },
		{ item: i('Black axe'), lvl: 10 },
		{ item: i('Steel battleaxe'), lvl: 20 },
		{ item: i('Mithril axe'), lvl: 21 },
		{
			item: i('Black battleaxe'),
			lvl: 25
		},
		{
			item: i('White battleaxe'),
			lvl: 25
		},
		{ item: i('Mithril battleaxe'), lvl: 30 },
		{ item: i('Adamant axe'), lvl: 31 },
		{ item: i('Rune axe'), lvl: 41 },
		{ item: i('Rune battleaxe'), lvl: 50 },
		{ item: i('Gilded axe'), lvl: 61 },
		{ item: i('Dragon axe'), lvl: 61 },
		{ item: i('3rd age axe'), lvl: 60, flags: new Set(['third_age']) },
		{ item: i('Crystal axe'), lvl: 61 },
		{ item: i('Dragon battleaxe'), lvl: 60 },
		{ item: i('Dwarven battleaxe'), lvl: 80, flags: new Set(['dwarven']) }
	],
	parts: { heavy: 3, base: 35, sharp: 30 }
};
