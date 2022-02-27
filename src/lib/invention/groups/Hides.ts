import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Hides: DisassemblySourceGroup = {
	name: 'Hides',
	items: [{ item: i("Blue dragonhide"), lvl: 66 },],
	parts: {},
  partQuantity: 1
};

export default Hides;
