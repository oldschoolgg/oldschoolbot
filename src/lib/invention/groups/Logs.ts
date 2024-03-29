import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Logs: DisassemblySourceGroup = {
	name: 'Logs',
	items: [
		{ item: i('Arctic pyre logs'), lvl: 1 },
		{ item: i('Logs'), lvl: 1 },
		{ item: i('Magic pyre logs'), lvl: 1 },
		{ item: i('Mahogany pyre logs'), lvl: 1 },
		{ item: i('Maple pyre logs'), lvl: 1 },
		{ item: i('Oak pyre logs'), lvl: 1 },
		{ item: i('Pyre logs'), lvl: 1 },
		{ item: i('Teak pyre logs'), lvl: 1 },
		{ item: i('Willow pyre logs'), lvl: 1 },
		{ item: i('Yew pyre logs'), lvl: 1 },
		{ item: i('Oak logs'), lvl: 15 },
		{ item: i('Willow logs'), lvl: 30 },
		{ item: i('Teak logs'), lvl: 35 },
		{ item: i('Arctic pine logs'), lvl: 42 },
		{ item: i('Maple logs'), lvl: 45 },
		{ item: i('Mahogany logs'), lvl: 50 },
		{ item: i('Yew logs'), lvl: 60 },
		{ item: i('Magic logs'), lvl: 75 },
		{ item: i('Blisterwood logs'), lvl: 76 },
		{ item: i('Redwood logs'), lvl: 90 },
		{ item: i('Elder logs'), lvl: 90 }
	],
	parts: { organic: 5, wooden: 95 }
};
