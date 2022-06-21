import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const UncutGems: DisassemblySourceGroup = {
	name: 'UncutGems',
	items: [
		{ item: i('Uncut opal'), lvl: 1 },
		{ item: i('Uncut jade'), lvl: 13 },
		{ item: i('Uncut red topaz'), lvl: 16 },
		{ item: i('Uncut sapphire'), lvl: 20 },
		{ item: i('Uncut emerald'), lvl: 27 },
		{ item: i('Uncut ruby'), lvl: 34 },
		{ item: i('Uncut diamond'), lvl: 43 },
		{ item: i('Uncut dragonstone'), lvl: 55 },
		{ item: i('Uncut onyx'), lvl: 67 },
		{ item: i('Uncut zenyte'), lvl: 75 }
	],
	parts: { precious: 60, smooth: 30 }
};
