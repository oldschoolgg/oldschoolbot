import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const RangedShield: DisassemblySourceGroup = {
	name: 'RangedShield',
	items: [
		{ item: i('Hard leather shield'), lvl: 10 },
		{
			item: i('Elysian spirit shield'),
			lvl: 75,
			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 4 }] }
		}
	],
	parts: {},
	partQuantity: 8
};

export default RangedShield;
