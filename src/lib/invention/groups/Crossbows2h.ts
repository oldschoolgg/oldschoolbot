import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Crossbows2h: DisassemblySourceGroup = {
	name: 'Crossbows2h',
	items: [
		{ item: i('Orange salamander'), lvl: 50, partQuantity: 12 },
		{ item: i('Red salamander'), lvl: 60, partQuantity: 12 },
		{ item: i('Black salamander'), lvl: 70, partQuantity: 12 },
		{
			item: i("Karil's crossbow"),
			lvl: 70,
			partQuantity: 12,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 12 }] }
		}
	],
	parts: { stunning: 3, dextrous: 2, connector: 35, tensile: 30, crafted: 30 }
};

export default Crossbows2h;
