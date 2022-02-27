import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Scimitar: DisassemblySourceGroup = {
	name: 'Scimitar',
	items: [
		{ item: i('Iron sickle'), lvl: 1 },
		{ item: i('Silver sickle'), lvl: 1 },
		{ item: i('Silver sickle (b)'), lvl: 1 },
		{
			item: i('Black scimitar'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{
			item: i('White scimitar'),
			lvl: 25,
			special: { always: true, parts: [{ type: 'knightly', chance: 100, amount: 8 }] }
		},
		{ item: i('Brine sabre'), lvl: 40 },
		{ item: i('Dragon scimitar'), lvl: 60 }
	],
	parts: { blade: 30, metallic: 30, subtle: 2, sharp: 3, base: 35 },
	partQuantity: 8
};

export default Scimitar;
