import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Glass2: DisassemblySourceGroup = {
	name: 'Glass2',
	items: [{ item: i("Beer glass"), lvl: 1 },{ item: i("Fishbowl"), lvl: 42 },{ item: i("Unpowered orb"), lvl: 46 },{ item: i("Lantern lens"), lvl: 49 },{ item: i("Water orb"), lvl: 56 },{ item: i("Earth orb"), lvl: 60 },{ item: i("Fire orb"), lvl: 63 },],
	parts: {},
  partQuantity: 2
};

export default Glass2;
