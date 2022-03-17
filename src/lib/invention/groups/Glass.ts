import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Glass: DisassemblySourceGroup = {
	name: 'Glass',
	items: [
		{ item: i('Vial'), lvl: 1, partQuantity: 1 },
		{ item: i('Molten glass'), lvl: 25, partQuantity: 1 },
		{ item: i('Beer glass'), lvl: 1, partQuantity: 2 },
		{ item: i('Fishbowl'), lvl: 42, partQuantity: 2 },
		{ item: i('Unpowered orb'), lvl: 46, partQuantity: 2 },
		{ item: i('Lantern lens'), lvl: 49, partQuantity: 2 },
		{ item: i('Water orb'), lvl: 56, partQuantity: 2 },
		{ item: i('Earth orb'), lvl: 60, partQuantity: 2 },
		{ item: i('Fire orb'), lvl: 63, partQuantity: 2 }
	],
	parts: { clear: 0, delicate: 0, smooth: 0, enhancing: 0 }
};

export default Glass;
