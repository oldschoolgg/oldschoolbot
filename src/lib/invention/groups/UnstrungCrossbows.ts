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
	parts: { connector: 0, tensile: 0, spiked: 0, stunning: 0, dextrous: 0 }
};

export default UnstrungCrossbows;
