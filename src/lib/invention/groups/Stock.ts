import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Stock: DisassemblySourceGroup = {
	name: 'Stock',
	items: [
		{ item: i('Wooden stock'), lvl: 4, partQuantity: 2 },
		{ item: i('Oak stock'), lvl: 12, partQuantity: 2 },
		{ item: i('Willow stock'), lvl: 19, partQuantity: 2 },
		{ item: i('Steel limbs'), lvl: 20, partQuantity: 2 },
		{ item: i('Teak stock'), lvl: 23, partQuantity: 2 },
		{ item: i('Maple stock'), lvl: 27, partQuantity: 2 },
		{ item: i('Mahogany stock'), lvl: 30, partQuantity: 2 },
		{ item: i('Yew stock'), lvl: 34, partQuantity: 2 },
		{ item: i('Magic stock'), lvl: 47, partQuantity: 2 },
		{ item: i('Dragon limbs'), lvl: 60, partQuantity: 2 }
	],
	parts: { connector: 35, tensile: 30, spiked: 30, stunning: 3, dextrous: 2 }
};

export default Stock;
