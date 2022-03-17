import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Scimitar: DisassemblySourceGroup = {
	name: 'Scimitar',
	items: [
		{ item: i('Iron sickle'), lvl: 1, partQuantity: 8 },
		{ item: i('Silver sickle'), lvl: 1, partQuantity: 8 },
		{ item: i('Silver sickle (b)'), lvl: 1, partQuantity: 8 },
		{
			item: i('Black scimitar'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White scimitar'),
			lvl: 25,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Brine sabre'), lvl: 40, partQuantity: 8 },
		{ item: i('Dragon scimitar'), lvl: 60, partQuantity: 8 },
		{ item: i('Bronze scimitar'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron scimitar'), lvl: 10, partQuantity: 8 },
		{ item: i('Steel scimitar'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril scimitar'), lvl: 30, partQuantity: 8 },
		{ item: i('Rune scimitar'), lvl: 50, partQuantity: 8 }
	],
	parts: { blade: 30, metallic: 30, subtle: 2, sharp: 3, base: 35 }
};

export default Scimitar;
