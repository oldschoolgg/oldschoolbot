import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Sword: DisassemblySourceGroup = {
	name: 'Sword',
	items: [
		{ item: i('Bronze 2h sword'), lvl: 1 },
		{ item: i('Iron 2h sword'), lvl: 10 },
		{ item: i('Steel 2h sword'), lvl: 20 },
		{
			item: i('Black sword'),
			lvl: 25
		},
		{
			item: i('White sword'),
			lvl: 25
		},
		{ item: i('Toktz-xil-ak'), lvl: 60 },
		{ item: i('Bronze sword'), lvl: 1 },
		{ item: i('Iron sword'), lvl: 10 },
		{ item: i('Steel sword'), lvl: 20 },
		{ item: i('Mithril sword'), lvl: 40 },
		{ item: i('Mithril 2h sword'), lvl: 45 },
		{ item: i('Adamant sword'), lvl: 50 },
		{ item: i('Adamant 2h sword'), lvl: 60 },
		{ item: i('Rune sword'), lvl: 60 },
		{ item: i('Rune 2h sword'), lvl: 70 },
		{ item: i('Dragon 2h sword'), lvl: 80, flags: new Set(['orikalkum']) },
		{ item: i('Leaf-bladed sword'), lvl: 60 },
		{ item: i('Dragon sword'), lvl: 80, flags: new Set(['orikalkum']) },
		{
			item: [
				'Armadyl godsword',
				'Ancient godsword',
				'Bandos godsword',
				'Saradomin godsword',
				'Saradomin sword',
				'Zamorak godsword'
			].map(i),
			lvl: 99
		}
	],
	parts: { sharp: 30, metallic: 30, swift: 10, dextrous: 2, powerful: 10 }
};
