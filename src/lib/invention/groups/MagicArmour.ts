import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MagicArmour: DisassemblySourceGroup = {
	name: 'MagicArmour',
	items: [
		{
			item: i('Elemental helmet'),
			lvl: 1,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'harnessed', chance: 100, amount: 8 }] }
		},
		{ item: i('Splitbark body'), lvl: 40, partQuantity: 8 },
		{
			item: i('Enchanted top'),
			lvl: 45,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Skeletal top'), lvl: 50, partQuantity: 8 },
		{ item: i('Infinity top'), lvl: 55, partQuantity: 8 },
		{ item: i('Lunar torso'), lvl: 60, partQuantity: 8 },
		{ item: i("Zuriel's robe top"), lvl: 78, partQuantity: 8 },
		{ item: i('Wizard boots'), lvl: 1, partQuantity: 4 },
		{ item: i('Splitbark boots'), lvl: 40, partQuantity: 4 },
		{ item: i('Splitbark gauntlets'), lvl: 40, partQuantity: 4 },
		{ item: i('Skeletal boots'), lvl: 50, partQuantity: 4 },
		{ item: i('Infinity boots'), lvl: 55, partQuantity: 4 },
		{ item: i('Lunar boots'), lvl: 60, partQuantity: 4 },
		{ item: i('Lunar cape'), lvl: 60, partQuantity: 6 },
		{ item: i('Skeletal gloves'), lvl: 50, partQuantity: 4 },
		{ item: i('Infinity gloves'), lvl: 55, partQuantity: 4 },
		{ item: i('Lunar gloves'), lvl: 60, partQuantity: 4 },
		{ item: i('Body tiara'), lvl: 1, partQuantity: 6 },
		{ item: i('Chaos tiara'), lvl: 1, partQuantity: 6 },
		{ item: i('Cosmic tiara'), lvl: 1, partQuantity: 6 },
		{ item: i('Earth tiara'), lvl: 1, partQuantity: 6 },
		{ item: i('Law tiara'), lvl: 1, partQuantity: 6 },
		{ item: i('Mind tiara'), lvl: 1, partQuantity: 6 },
		{ item: i('Nature tiara'), lvl: 1, partQuantity: 6 },
		{ item: i('Water tiara'), lvl: 1, partQuantity: 6 },
		{ item: i("Dagon'hai hat"), lvl: 40, partQuantity: 6 },
		{ item: i("Dagon'hai robe bottom"), lvl: 40, partQuantity: 6 },
		{ item: i("Dagon'hai robe top"), lvl: 40, partQuantity: 6 },
		{ item: i('Splitbark helm'), lvl: 40, partQuantity: 6 },
		{
			item: i('Enchanted hat'),
			lvl: 45,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{ item: i('Farseer helm'), lvl: 45, partQuantity: 6 },
		{ item: i('Healer hat'), lvl: 50, partQuantity: 6 },
		{ item: i('Skeletal helm'), lvl: 50, partQuantity: 6 },
		{ item: i('Infinity hat'), lvl: 55, partQuantity: 6 },
		{ item: i('Lunar helm'), lvl: 60, partQuantity: 6 },
		{ item: i("Zuriel's hood"), lvl: 78, partQuantity: 6 },
		{ item: i('Splitbark legs'), lvl: 40, partQuantity: 8 },
		{
			item: i('Enchanted robe'),
			lvl: 45,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Skeletal bottoms'), lvl: 50, partQuantity: 8 },
		{ item: i('Infinity bottoms'), lvl: 55, partQuantity: 8 },
		{ item: i('Lunar legs'), lvl: 60, partQuantity: 8 },
		{ item: i("Zuriel's robe bottom"), lvl: 78, partQuantity: 8 },
		{
			item: i('Elemental shield'),
			lvl: 1,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'harnessed', chance: 100, amount: 8 }] }
		},
		{
			item: i('Mind shield'),
			lvl: 1,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'harnessed', chance: 100, amount: 8 }] }
		},
		{
			item: i('Dragonfire ward'),
			lvl: 70,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'dragonfire', chance: 100, amount: 3 }] }
		},
		{
			item: i('Arcane spirit shield'),
			lvl: 75,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 4 }] }
		},
		{
			item: i('Spectral spirit shield'),
			lvl: 75,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 4 }] }
		}
	],
	parts: { cover: 35, magic: 30, deflecting: 30, powerful: 3, protective: 2 }
};

export default MagicArmour;
