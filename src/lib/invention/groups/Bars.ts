import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Bars: DisassemblySourceGroup = {
	name: 'Bars',
	items: [
		{ item: i('Bronze bar'), lvl: 1 },
		{ item: i('Blurite bar'), lvl: 8 },
		{ item: i('Iron bar'), lvl: 10 },
		{ item: i('Silver bar'), lvl: 20 },
		{ item: i('Steel bar'), lvl: 20 },
		{ item: i('Mithril bar'), lvl: 30 },
		{ item: i('Gold bar'), lvl: 40 }
	],
	parts: { simple: 75 }
};
