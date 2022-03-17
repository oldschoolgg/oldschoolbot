import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Gems: DisassemblySourceGroup = {
	name: 'Gems',
	items: [
		{ item: i('Opal'), lvl: 1, partQuantity: 2 },
		{ item: i('Jade'), lvl: 13, partQuantity: 2 },
		{ item: i('Red topaz'), lvl: 16, partQuantity: 2 },
		{ item: i('Sapphire'), lvl: 20, partQuantity: 2 },
		{ item: i('Emerald'), lvl: 27, partQuantity: 2 },
		{ item: i('Ruby'), lvl: 34, partQuantity: 2 },
		{ item: i('Diamond'), lvl: 43, partQuantity: 2 },
		{ item: i('Dragonstone'), lvl: 55, partQuantity: 2 },
		{ item: i('Onyx'), lvl: 67, partQuantity: 2 }
	],
	parts: { clear: 35, faceted: 1, precious: 3, light: 2, delicate: 30, smooth: 30 }
};

export default Gems;
