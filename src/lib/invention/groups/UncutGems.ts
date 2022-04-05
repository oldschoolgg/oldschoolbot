import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const UncutGems: DisassemblySourceGroup = {
	name: 'UncutGems',
	items: [
		{ item: i('Uncut opal'), lvl: 1, partQuantity: 1 },
		{ item: i('Uncut jade'), lvl: 13, partQuantity: 1 },
		{ item: i('Uncut red topaz'), lvl: 16, partQuantity: 1 },
		{ item: i('Uncut sapphire'), lvl: 20, partQuantity: 1 },
		{ item: i('Uncut emerald'), lvl: 27, partQuantity: 1 },
		{ item: i('Uncut ruby'), lvl: 34, partQuantity: 1 },
		{ item: i('Uncut diamond'), lvl: 43, partQuantity: 1 },
		{ item: i('Uncut dragonstone'), lvl: 55, partQuantity: 1 },
		{ item: i('Uncut onyx'), lvl: 67, partQuantity: 1 }
	],
	parts: { clear: 35, delicate: 30, smooth: 30, precious: 3, light: 2, faceted: 1 }
};

export default UncutGems;
