import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MagicArmour: DisassemblySourceGroup = {
	name: 'MagicArmour',
	items: [
		{ item: i('Splitbark body'), lvl: 40 },
		{
			item: i('Enchanted top'),
			lvl: 45
		},
		{ item: i('Infinity top'), lvl: 55 },
		{ item: i("Zuriel's robe top"), lvl: 78 },
		{ item: i('Wizard boots'), lvl: 1 },
		{ item: i('Splitbark boots'), lvl: 40 },
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
		{
			item: ['3rd age cloak', '3rd age druidic robe bottoms', '3rd age druidic robe top', '3rd age mage hat'].map(
				i
			),
			lvl: 65,
			flags: ['third_age']
		},
		{ item: i("Ahrim's robeskirt"), lvl: 70 },
		{ item: i("Ahrim's robetop"), lvl: 70 },
		{ item: i("Ahrim's hood"), lvl: 70 },
		{ item: i("Zuriel's robe bottom"), lvl: 78 },
		{
			item: i('Dragonfire ward'),
			lvl: 70
		},
		{
			item: i('Arcane spirit shield'),
			lvl: 75,

			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 4 }] }
		},
		{
			item: i('Spectral spirit shield'),
			lvl: 75,

			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 4 }] }
		},
		{
			item: ['Ancestral hat', 'Ancestral robe top', 'Ancestral robe bottom'].map(i),
			lvl: 75
		}
	],
	parts: { magic: 30, powerful: 3, protective: 32 }
};
