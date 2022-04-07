import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Longsword: DisassemblySourceGroup = {
	name: 'Longsword',
	items: [
		{ item: i('Blurite sword'), lvl: 1, partQuantity: 8 },
		{ item: i('Fremennik blade'), lvl: 1, partQuantity: 8 },
		{ item: i('Jade machete'), lvl: 1, partQuantity: 8 },
		{ item: i('Machete'), lvl: 1, partQuantity: 8 },
		{ item: i('Opal machete'), lvl: 1, partQuantity: 8 },
		{ item: i('Red topaz machete'), lvl: 1, partQuantity: 8 },
		{ item: i('Teasing stick'), lvl: 1, partQuantity: 8 },
		{
			item: i('Wooden spoon'),
			lvl: 1,
			partQuantity: 8,
			special: { always: false, parts: [{ type: 'culinary', chance: 100, amount: 8 }] }
		},
		{
			item: i('Black longsword'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White longsword'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Dragon longsword'), lvl: 60, partQuantity: 8 },
		{ item: i("Vesta's longsword"), lvl: 78, partQuantity: 8 },
		{ item: i('Bronze longsword'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron longsword'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel longsword'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril longsword'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune longsword'), lvl: 50, partQuantity: 8 }
	],
	parts: { blade: 30, metallic: 30, sharp: 3, base: 35, dextrous: 2 }
};

export default Longsword;
