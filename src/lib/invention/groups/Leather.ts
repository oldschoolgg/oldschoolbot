import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Leather: DisassemblySourceGroup = {
	name: 'Leather',
	items: [
		{ item: i('Leather'), lvl: 1, partQuantity: 1 },
		{ item: i('Hard leather'), lvl: 25, partQuantity: 1 },
		{ item: i('Green dragon leather'), lvl: 57, partQuantity: 1 },
		{ item: i('Blue dragon leather'), lvl: 66, partQuantity: 1 }
	],
	parts: { simple: 0, crafted: 0 }
};

export default Leather;
