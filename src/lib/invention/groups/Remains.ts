import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Remains: DisassemblySourceGroup = {
	name: 'Remains',
	items: [
		{ item: i('Loar remains'), lvl: 5, partQuantity: 1 },
		{ item: i('Phrin remains'), lvl: 20, partQuantity: 1 },
		{ item: i('Riyl remains'), lvl: 35, partQuantity: 1 },
		{ item: i('Asyn remains'), lvl: 63, partQuantity: 1 },
		{ item: i('Fiyr remains'), lvl: 80, partQuantity: 1 }
	],
	parts: { organic: 98, pious: 2 }
};

export default Remains;
