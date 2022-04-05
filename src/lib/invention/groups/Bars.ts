import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Bars: DisassemblySourceGroup = {
	name: 'Bars',
	items: [
		{ item: i('Bronze bar'), lvl: 1, partQuantity: 2 },
		{ item: i('Blurite bar'), lvl: 8, partQuantity: 2 },
		{ item: i('Iron bar'), lvl: 10, partQuantity: 2 },
		{ item: i('Silver bar'), lvl: 20, partQuantity: 2 },
		{ item: i('Steel bar'), lvl: 20, partQuantity: 2 },
		{ item: i('Mithril bar'), lvl: 30, partQuantity: 2 },
		{ item: i('Gold bar'), lvl: 40, partQuantity: 2 }
	],
	parts: { simple: 75, crafted: 25 }
};

export default Bars;
