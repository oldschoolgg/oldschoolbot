import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Glass1: DisassemblySourceGroup = {
	name: 'Glass1',
	items: [
		{ item: i('Vial'), lvl: 1 },
		{ item: i('Molten glass'), lvl: 25 }
	],
	parts: {},
	partQuantity: 1
};

export default Glass1;
