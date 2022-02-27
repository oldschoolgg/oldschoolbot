import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Stock: DisassemblySourceGroup = {
	name: 'Stock',
	items: [{ item: i("Wooden stock"), lvl: 4 },{ item: i("Oak stock"), lvl: 12 },{ item: i("Willow stock"), lvl: 19 },{ item: i("Steel limbs"), lvl: 20 },{ item: i("Teak stock"), lvl: 23 },{ item: i("Maple stock"), lvl: 27 },{ item: i("Mahogany stock"), lvl: 30 },{ item: i("Yew stock"), lvl: 34 },{ item: i("Magic stock"), lvl: 47 },{ item: i("Dragon limbs"), lvl: 60 },],
	parts: {},
  partQuantity: 2
};

export default Stock;
