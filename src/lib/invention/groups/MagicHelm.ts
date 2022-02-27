import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MagicHelm: DisassemblySourceGroup = {
	name: 'MagicHelm',
	items: [
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
			lvl: 45,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{ item: i('Farseer helm'), lvl: 45 },
		{ item: i('Healer hat'), lvl: 50 },
		{ item: i('Skeletal helm'), lvl: 50 },
		{ item: i('Infinity hat'), lvl: 55 },
		{ item: i('Lunar helm'), lvl: 60 },
		{ item: i("Zuriel's hood"), lvl: 78 }
	],
	parts: {},
	partQuantity: 6
};

export default MagicHelm;
