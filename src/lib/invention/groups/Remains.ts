import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Remains: DisassemblySourceGroup = {
	name: 'Remains',
	items: [
		{ item: i('Loar remains'), lvl: 5 },
		{ item: i('Phrin remains'), lvl: 20 },
		{ item: i('Riyl remains'), lvl: 35 },
		{ item: i('Asyn remains'), lvl: 63 },
		{ item: i('Fiyr remains'), lvl: 80 }
	],
	parts: {},
	partQuantity: 1
};

export default Remains;
