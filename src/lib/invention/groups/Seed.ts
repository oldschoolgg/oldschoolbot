import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Seed: DisassemblySourceGroup = {
	name: 'Seed',
	items: [{ item: i("Apple sapling"), lvl: 27 },{ item: i("Calquat sapling"), lvl: 72 },{ item: i("Calquat seedling"), lvl: 72 },{ item: i("Calquat seedling (w)"), lvl: 72 },],
	parts: {},
  partQuantity: 1
};

export default Seed;
