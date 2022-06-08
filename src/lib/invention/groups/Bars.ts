import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Bars: DisassemblySourceGroup = {
	name: 'Bars',
	description: 'Metal bars.',
	items: [
		{ item: i('Bronze bar'), lvl: 1 },
		{ item: i('Blurite bar'), lvl: 8 },
		{ item: i('Iron bar'), lvl: 10 },
		{ item: i('Silver bar'), lvl: 20 },
		{ item: i('Steel bar'), lvl: 20 },
		{ item: i('Mithril bar'), lvl: 30 },
		{ item: i('Gold bar'), lvl: 40 },
		{ item: i('Adamantite bar'), lvl: 70 },
		{ item: i('Runite bar'), lvl: 90 }
	],
	parts: { simple: 25, metallic: 75 }
};
