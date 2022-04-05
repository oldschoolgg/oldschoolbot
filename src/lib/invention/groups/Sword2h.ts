import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Sword2h: DisassemblySourceGroup = {
	name: 'Sword2h',
	items: [
		{ item: i('Slender blade'), lvl: 1, partQuantity: 12 },
		{
			item: i('Spatula'),
			lvl: 10,
			partQuantity: 12,
			special: { always: false, parts: [{ type: 'culinary', chance: 100, amount: 12 }] }
		},
		{
			item: i('Black 2h sword'),
			lvl: 25,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 12 }] }
		},
		{
			item: i('White 2h sword'),
			lvl: 25,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 12 }] }
		},
		{ item: i('Dragon 2h sword'), lvl: 60, partQuantity: 12 },
		{
			item: i('Armadyl godsword'),
			lvl: 75,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 12 }] }
		},
		{
			item: i('Bandos godsword'),
			lvl: 75,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'bandos', chance: 100, amount: 12 }] }
		},
		{
			item: i('Saradomin godsword'),
			lvl: 75,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'saradomin', chance: 100, amount: 12 }] }
		},
		{
			item: i('Saradomin sword'),
			lvl: 75,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'saradomin', chance: 100, amount: 12 }] }
		},
		{
			item: i('Zamorak godsword'),
			lvl: 75,
			partQuantity: 12,
			special: { always: true, parts: [{ type: 'zamorak', chance: 100, amount: 12 }] }
		},
		{ item: i('Bronze 2h sword'), lvl: 1, partQuantity: 16 },
		{ item: i('Iron 2h sword'), lvl: 10, partQuantity: 16 },
		{ item: i('Steel 2h sword'), lvl: 20, partQuantity: 16 },
		{ item: i('Mithril 2h sword'), lvl: 30, partQuantity: 16 },
		{ item: i('Rune 2h sword'), lvl: 50, partQuantity: 16 },
		{ item: i('Godsword blade'), lvl: 75, partQuantity: 6 }
	],
	parts: { blade: 30, metallic: 30, strong: 2, sharp: 3, base: 35 }
};

export default Sword2h;
