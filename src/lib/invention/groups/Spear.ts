import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Spear: DisassemblySourceGroup = {
	name: 'Spear',
	items: [
		{ item: i('Bronze spear'), lvl: 1 },
		{ item: i('Iron spear'), lvl: 10 },
		{ item: i('Steel spear'), lvl: 20 },
		{
			item: i('Black spear'),
			lvl: 25
		},
		{ item: i('Mithril spear'), lvl: 30 },
		{ item: i('Adamant spear'), lvl: 40 },
		{ item: i('Rune spear'), lvl: 50 },
		{ item: i('Dragon spear'), lvl: 60, flags: new Set(['orikalkum']) },
		{
			item: i('Zamorakian spear'),
			lvl: 75
		},
		{ item: i("Vesta's spear"), lvl: 78 }
	],
	parts: { sharp: 30 }
};
