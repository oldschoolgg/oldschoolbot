import type { DisassemblySourceGroup } from '..';
import { brokenVirtusOutfit, virtusOutfit } from '../../data/CollectionsExport';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const MagicArmour: DisassemblySourceGroup = {
	name: 'MagicArmour',
	items: [
		{
			item: [
				'Blue wizard hat (t)',
				'Blue wizard robe (t)',
				'Black wizard hat (g)',
				'Black wizard hat (t)',
				'Black wizard robe (g)',
				'Black wizard robe (t)',
				'Blue skirt',
				'Blue skirt (g)',
				'Blue wizard hat',
				'Blue wizard hat (g)',
				'Blue wizard robe',
				'Blue wizard robe (g)'
			].map(i),
			lvl: 5
		},
		{ item: i('Splitbark body'), lvl: 40 },
		{
			item: i('Enchanted top'),
			lvl: 45
		},
		{ item: i('Infinity top'), lvl: 55 },
		{ item: i("Zuriel's robe top"), lvl: 78 },
		{ item: i('Wizard boots'), lvl: 1 },
		{ item: i('Splitbark boots'), lvl: 40 },
		{
			item: [
				'Mystic boots',
				'Mystic boots (dark)',
				'Mystic boots (dusk)',
				'Mystic boots (light)',
				'Mystic dust staff',
				'Mystic gloves',
				'Mystic gloves (dark)',
				'Mystic gloves (dusk)',
				'Mystic gloves (light)',
				'Mystic hat',
				'Mystic hat (dark)',
				'Mystic hat (dusk)',
				'Mystic hat (light)',
				'Mystic mist staff',
				'Mystic robe bottom',
				'Mystic robe bottom (dark)',
				'Mystic robe bottom (dusk)',
				'Mystic robe bottom (light)',
				'Mystic robe top',
				'Mystic robe top (dark)',
				'Mystic robe top (dusk)',
				'Mystic robe top (light)'
			].map(i),
			lvl: 40
		},
		{ item: i('Splitbark gauntlets'), lvl: 40 },
		{ item: i('Infinity boots'), lvl: 55 },
		{ item: i('Infinity gloves'), lvl: 55 },
		{ item: i('Body tiara'), lvl: 1 },
		{ item: i('Chaos tiara'), lvl: 1 },
		{ item: i('Cosmic tiara'), lvl: 1 },
		{ item: i('Earth tiara'), lvl: 1 },
		{ item: i('Law tiara'), lvl: 1 },
		{ item: i('Mind tiara'), lvl: 1 },
		{ item: i('Nature tiara'), lvl: 1 },
		{ item: i('Water tiara'), lvl: 1 },
		{ item: i("Dagon'hai hat"), lvl: 40 },
		{ item: i("Dagon'hai robe bottom"), lvl: 40 },
		{ item: i("Dagon'hai robe top"), lvl: 40 },
		{ item: i('Splitbark helm'), lvl: 40 },
		{
			item: i('Enchanted hat'),
			lvl: 45
		},
		{ item: i('Farseer helm'), lvl: 45 },
		{ item: i('Healer hat'), lvl: 50 },
		{ item: i('Infinity hat'), lvl: 55 },
		{ item: i("Zuriel's hood"), lvl: 78 },
		{ item: i('Splitbark legs'), lvl: 40 },
		{
			item: i('Enchanted robe'),
			lvl: 45
		},
		{ item: i('Infinity bottoms'), lvl: 55 },
		{ item: i("Zuriel's robe bottom"), lvl: 78 },
		{
			item: i('Dragonfire ward'),
			lvl: 70
		},
		{
			item: i('Arcane spirit shield'),
			lvl: 99,
			flags: new Set(['corporeal'])
		},
		{
			item: i('Spectral spirit shield'),
			lvl: 99,
			flags: new Set(['corporeal'])
		},
		{
			item: ['Ancestral hat', 'Ancestral robe top', 'Ancestral robe bottom'].map(i),
			lvl: 75
		},
		{
			item: [...virtusOutfit, ...brokenVirtusOutfit].map(i),
			lvl: 99
		}
	],
	parts: { magic: 30, powerful: 5, protective: 32 }
};
