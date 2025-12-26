import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

import { Items } from 'oldschooljs';

const i = Items.getOrThrow.bind(Items);

export const EnsouledHeads: DisassemblySourceGroup = {
	name: 'Ensouled Heads',
	items: [
		{
			item: i('Ensouled abyssal head'),
			lvl: 90
		},
		{
			item: i('Ensouled aviansie head'),
			lvl: 90
		},
		{
			item: i('Ensouled bear head'),
			lvl: 16
		},
		{
			item: i('Ensouled bloodveld head'),
			lvl: 72
		},
		{
			item: i('Ensouled chaos druid head'),
			lvl: 41
		},
		{
			item: i('Ensouled dagannoth head'),
			lvl: 72
		},
		{
			item: i('Ensouled demon head'),
			lvl: 72
		},
		{
			item: i('Ensouled dog head'),
			lvl: 41
		},
		{
			item: i('Ensouled dragon head'),
			lvl: 90
		},
		{
			item: i('Ensouled elf head'),
			lvl: 41
		},
		{
			item: i('Ensouled giant head'),
			lvl: 41
		},
		{
			item: i('Ensouled goblin head'),
			lvl: 16
		},
		{
			item: i('Ensouled horror head'),
			lvl: 41
		},
		{
			item: i('Ensouled imp head'),
			lvl: 16
		},
		{
			item: i('Ensouled kalphite head'),
			lvl: 72
		},
		{
			item: i('Ensouled minotaur head'),
			lvl: 16
		},
		{
			item: i('Ensouled monkey head'),
			lvl: 16
		},
		{
			item: i('Ensouled ogre head'),
			lvl: 41
		},
		{
			item: i('Ensouled scorpion head'),
			lvl: 16
		},
		{
			item: i('Ensouled troll head'),
			lvl: 41
		},
		{
			item: i('Ensouled tzhaar head'),
			lvl: 72
		},
		{
			item: i('Ensouled unicorn head'),
			lvl: 16
		}
	],
	parts: { pious: 40, magic: 10, organic: 20 }
};
