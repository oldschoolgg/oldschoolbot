import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

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
			item: i('Spectral sigil'),
			lvl: 80,
			flags: new Set(['corporeal'])
		},
		{
			item: i('Arcane sigil'),
			lvl: 99,
			flags: new Set(['corporeal'])
		},
		{
			item: i('Elysian sigil'),
			lvl: 99,
			flags: new Set(['corporeal'])
		},
		{
			item: i('Divine sigil'),
			lvl: 99,
			flags: new Set(['corporeal'])
		},
		{
			item: i('Magus scroll'),
			lvl: 105
		}
	],
	parts: { magic: 30, powerful: 3, protective: 2 }
};
