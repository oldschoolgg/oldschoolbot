import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Knives: DisassemblySourceGroup = {
	name: 'Knives',
	items: [
		{ item: i('Bronze knife'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron knife'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel knife'), lvl: 20, partQuantity: 8 },
		{
			item: i('Black knife'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Mithril knife'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune knife'), lvl: 50, partQuantity: 8 },
		{ item: i('Dragon knife'), lvl: 60, partQuantity: 8 }
	],
	parts: { simple: 35, metallic: 30, sharp: 3, swift: 2, blade: 30 }
};

export default Knives;
