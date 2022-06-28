import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Metals: DisassemblySourceGroup = {
	name: 'Metals',
	description: 'Metal bars, dart tips.',
	items: [
		{ item: i('Bronze bar'), lvl: 20 },
		{ item: i('Bronze dart tip'), lvl: 2 },
		{ item: i('Blurite bar'), lvl: 8 },
		{ item: i('Iron bar'), lvl: 40 },
		{ item: i('Iron dart tip'), lvl: 3 },
		{ item: i('Silver bar'), lvl: 50 },
		{ item: i('Steel bar'), lvl: 60 },
		{ item: i('Steel dart tip'), lvl: 5 },
		{ item: i('Mithril bar'), lvl: 85 },
		{ item: i('Mithril dart tip'), lvl: 7 },
		{ item: i('Gold bar'), lvl: 50 },
		{ item: i('Adamantite bar'), lvl: 95 },
		{ item: i('Adamant dart tip'), lvl: 8 },
		{ item: i('Runite bar'), lvl: 99 },
		{ item: i('Rune dart tip'), lvl: 9 },
		{ item: i('Dragon dart tip'), lvl: 80, flags: new Set(['orikalkum']) }
	],
	parts: { strong: 10, plated: 10, heavy: 10, metallic: 70 }
};
