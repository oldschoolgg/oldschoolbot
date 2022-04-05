import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Talisman: DisassemblySourceGroup = {
	name: 'Talisman',
	items: [
		{ item: i('Mind talisman'), lvl: 1, partQuantity: 1 },
		{ item: i('Water talisman'), lvl: 5, partQuantity: 1 },
		{ item: i('Earth talisman'), lvl: 9, partQuantity: 1 },
		{ item: i('Fire talisman'), lvl: 14, partQuantity: 1 },
		{ item: i('Body talisman'), lvl: 20, partQuantity: 1 },
		{ item: i('Cosmic talisman'), lvl: 27, partQuantity: 1 },
		{ item: i('Chaos talisman'), lvl: 35, partQuantity: 1 },
		{ item: i('Nature talisman'), lvl: 44, partQuantity: 1 },
		{ item: i('Law talisman'), lvl: 54, partQuantity: 1 },
		{ item: i('Elemental talisman'), lvl: 58, partQuantity: 1 },
		{ item: i('Death talisman'), lvl: 65, partQuantity: 1 }
	],
	parts: { magic: 85, crafted: 13, powerful: 2 }
};

export default Talisman;
