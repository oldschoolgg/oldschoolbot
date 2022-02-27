import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const RangedCape: DisassemblySourceGroup = {
	name: 'RangedCape',
	items: [
		{ item: i("Ava's accumulator"), lvl: 1 },
		{
			item: i('Armadyl cloak'),
			lvl: 40,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		}
	],
	parts: {},
	partQuantity: 6
};

export default RangedCape;
