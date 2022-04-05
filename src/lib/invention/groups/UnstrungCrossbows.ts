import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const UnstrungCrossbows: DisassemblySourceGroup = {
	name: 'UnstrungCrossbows',
	items: [
		{ item: i('Bronze crossbow (u)'), lvl: 4, partQuantity: 4 },
		{ item: i('Iron crossbow (u)'), lvl: 19, partQuantity: 4 },
		{ item: i('Steel crossbow (u)'), lvl: 23, partQuantity: 4 },
		{ item: i('Mithril crossbow (u)'), lvl: 27, partQuantity: 4 },
		{ item: i('Runite crossbow (u)'), lvl: 34, partQuantity: 4 },
		{ item: i('Dragon crossbow (u)'), lvl: 47, partQuantity: 4 }
	],
	parts: { connector: 35, tensile: 30, spiked: 30, stunning: 3, dextrous: 2 }
};

export default UnstrungCrossbows;
