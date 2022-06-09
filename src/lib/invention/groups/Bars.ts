import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Bars: DisassemblySourceGroup = {
	name: 'Metals',
	description: 'Metal bars, dart tips.',
	items: [
		{ item: i('Bronze bar'), lvl: 1 },
		{ item: i('Bronze dart tip'), lvl: 1 },
		{ item: i('Blurite bar'), lvl: 8 },
		{ item: i('Iron bar'), lvl: 10 },
		{ item: i('Iron dart tip'), lvl: 10 },
		{ item: i('Silver bar'), lvl: 20 },
		{ item: i('Steel bar'), lvl: 20 },
		{ item: i('Steel dart tip'), lvl: 20 },
		{ item: i('Mithril bar'), lvl: 30 },
		{ item: i('Mithril dart tip'), lvl: 30 },
		{ item: i('Gold bar'), lvl: 40 },
		{ item: i('Adamantite bar'), lvl: 70 },
		{ item: i('Adamant dart tip'), lvl: 70 },
		{ item: i('Runite bar'), lvl: 90 },
		{ item: i('Rune dart tip'), lvl: 90 },
		{ item: i('Dragon dart tip'), lvl: 100 }
	],
	parts: { simple: 25, metallic: 75 }
};
