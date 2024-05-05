import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Axes: DisassemblySourceGroup = {
	name: 'Axes',
	description: 'Pickaxes, axes, thrownaxes, battleaxes!',
	items: [
		{ item: ['Bronze pickaxe', 'Bronze thrownaxe'].map(i), lvl: 1 },
		{ item: i('Iron pickaxe'), lvl: 10 },
		{ item: i('Iron thrownaxe'), lvl: 10 },
		{ item: i('Steel pickaxe'), lvl: 20 },
		{ item: i('Steel thrownaxe'), lvl: 20 },
		{ item: i('Mithril pickaxe'), lvl: 30 },
		{ item: i('Mithril thrownaxe'), lvl: 30 },
		{ item: i('Adamant thrownaxe'), lvl: 30 },
		{ item: i('Adamant pickaxe'), lvl: 50 },
		{ item: i('Adamant battleaxe'), lvl: 40 },
		{ item: i('Rune pickaxe'), lvl: 50 },
		{ item: i('Rune thrownaxe'), lvl: 30 },
		{ item: i('Dragon pickaxe'), lvl: 60, flags: new Set(['orikalkum']) },
		{
			item: i('Crystal pickaxe'),
			lvl: 71
		},
		// Axes
		{ item: i('Bronze axe'), lvl: 1 },
		{ item: i('Bronze battleaxe'), lvl: 1 },
		{ item: i('Iron battleaxe'), lvl: 10 },
		{ item: i('Iron axe'), lvl: 1 },
		{ item: i('Steel axe'), lvl: 6 },
		{ item: i('Black axe'), lvl: 10 },
		{ item: i('Black pickaxe'), lvl: 10 },
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
		{ item: i('Dragon axe'), lvl: 61, flags: new Set(['orikalkum']) },
		{ item: i('Dragon thrownaxe'), lvl: 61, flags: new Set(['orikalkum']) },
		{ item: i('Crystal axe'), lvl: 61 },
		{ item: i('Dragon battleaxe'), lvl: 60, flags: new Set(['orikalkum']) }
	],
	parts: { heavy: 30, base: 10, sharp: 30 }
};
