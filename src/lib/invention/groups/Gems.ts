import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Gems: DisassemblySourceGroup = {
	name: 'Gems',
	items: [{ item: i("Opal"), lvl: 1 },{ item: i("Jade"), lvl: 13 },{ item: i("Red topaz"), lvl: 16 },{ item: i("Sapphire"), lvl: 20 },{ item: i("Emerald"), lvl: 27 },{ item: i("Ruby"), lvl: 34 },{ item: i("Diamond"), lvl: 43 },{ item: i("Dragonstone"), lvl: 55 },{ item: i("Onyx"), lvl: 67 },],
	parts: {clear: 35, faceted: 1, precious: 3, light: 2, delicate: 30, smooth: 30},
  partQuantity: 2
};

export default Gems;
