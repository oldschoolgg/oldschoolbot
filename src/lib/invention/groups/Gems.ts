import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Gems: DisassemblySourceGroup = {
	name: 'Gems',
	items: [
		{ item: i('Opal'), lvl: 1 },
		{ item: i('Jade'), lvl: 13 },
		{ item: i('Red topaz'), lvl: 16 },
		{ item: i('Sapphire'), lvl: 20 },
		{ item: i('Emerald'), lvl: 27 },
		{ item: i('Ruby'), lvl: 34 },
		{ item: i('Diamond'), lvl: 43 },
		{ item: i('Dragonstone'), lvl: 55 },
		{ item: i('Onyx'), lvl: 67 },
		{ item: i('Zenyte'), lvl: 75 }
	],
	parts: { precious: 60, smooth: 30 }
};
