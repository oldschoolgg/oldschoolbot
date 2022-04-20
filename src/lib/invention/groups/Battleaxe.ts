import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Battleaxe: DisassemblySourceGroup = {
	name: 'Battleaxe',
	items: [
		{ item: i('Bronze battleaxe'), lvl: 1 },
		{ item: i('Iron battleaxe'), lvl: 10 },
		{ item: i('Steel battleaxe'), lvl: 20 },
		{ item: i('Mithril battleaxe'), lvl: 30 },
		{ item: i('Rune battleaxe'), lvl: 50 },
		{
			item: i('Black battleaxe'),
			lvl: 25
		},
		{
			item: i('White battleaxe'),
			lvl: 25
		},
		{ item: i('Dragon battleaxe'), lvl: 60 }
	],
	parts: { blade: 30, sharp: 3, smooth: 30 }
};
