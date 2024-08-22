import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Magic: DisassemblySourceGroup = {
	name: 'Magic',
	items: [
		{ item: i('Death tiara'), lvl: 1 },
		{ item: i('Fire tiara'), lvl: 1 },
		{ item: i('Beginner wand'), lvl: 45 },
		{ item: i('Apprentice wand'), lvl: 50 },
		{ item: i('Teacher wand'), lvl: 55 },
		{ item: i('Master wand'), lvl: 60 },
		{
			item: i('Mind helmet'),
			lvl: 1
		},
		{
			item: i('Jar of magic'),
			lvl: 80
		},
		{
			item: ['Arcane sigil', 'Spectral sigil', 'Elysian sigil', 'Divine sigil'].map(i),
			lvl: 99,
			flags: new Set(['corporeal'])
		},
		{
			item: [
				'Magus scroll',
				'Virtus crystal',
				'Virtus wand',
				'Primordial crystal',
				'Pegasian crystal',
				'Eternal crystal'
			].map(i),
			lvl: 99
		}
	],
	parts: { magic: 30, powerful: 3, protective: 2 }
};
