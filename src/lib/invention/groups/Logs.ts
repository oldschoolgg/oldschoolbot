import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Logs: DisassemblySourceGroup = {
	name: 'Logs',
	items: [
		{ item: i('Arctic pyre logs'), lvl: 1 },
		{ item: i('Blue logs'), lvl: 1 },
		{ item: i('Cowhide'), lvl: 1 },
		{ item: i('Green logs'), lvl: 1 },
		{ item: i('Logs'), lvl: 1 },
		{ item: i('Magic pyre logs'), lvl: 1 },
		{ item: i('Mahogany pyre logs'), lvl: 1 },
		{ item: i('Maple pyre logs'), lvl: 1 },
		{ item: i('Oak pyre logs'), lvl: 1 },
		{ item: i('Purple logs'), lvl: 1 },
		{ item: i('Pyre logs'), lvl: 1 },
		{ item: i('Red logs'), lvl: 1 },
		{ item: i('Teak pyre logs'), lvl: 1 },
		{ item: i('White logs'), lvl: 1 },
		{ item: i('Willow pyre logs'), lvl: 1 },
		{ item: i('Yew pyre logs'), lvl: 1 },
		{ item: i('Oak logs'), lvl: 15 },
		{ item: i('Willow logs'), lvl: 30 },
		{ item: i('Teak logs'), lvl: 35 },
		{ item: i('Arctic pine logs'), lvl: 42 },
		{ item: i('Yak-hide'), lvl: 43 },
		{ item: i('Maple logs'), lvl: 45 },
		{ item: i('Snake hide'), lvl: 45 },
		{ item: i('Mahogany logs'), lvl: 50 },
		{ item: i('Green dragonhide'), lvl: 57 },
		{ item: i('Yew logs'), lvl: 60 },
		{ item: i('Red dragonhide'), lvl: 73 },
		{ item: i('Magic logs'), lvl: 75 },
		{ item: i('Blisterwood logs'), lvl: 76 },
		{ item: i('Black dragonhide'), lvl: 79 }
	],
	parts: { living: 1, simple: 99 },
	partQuantity: 1
};

export default Logs;
