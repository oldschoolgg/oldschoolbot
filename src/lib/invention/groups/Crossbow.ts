import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Crossbow: DisassemblySourceGroup = {
	name: 'Crossbow',
	items: [
		{ item: i('Bronze crossbow'), lvl: 1 },
		{ item: i('Crossbow'), lvl: 1 },
		{ item: i('Iron crossbow'), lvl: 10 },
		{ item: i('Blurite crossbow (u)'), lvl: 12 },
		{ item: i('Blurite crossbow'), lvl: 16 },
		{ item: i('Steel crossbow'), lvl: 20 },
		{ item: i('Mithril crossbow'), lvl: 30 },
		{ item: i("Hunters' crossbow"), lvl: 50 },
		{ item: i('Dragon crossbow'), lvl: 60 }
	],
	parts: {},
	partQuantity: 8
};

export default Crossbow;
