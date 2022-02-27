import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Wand: DisassemblySourceGroup = {
	name: 'Wand',
	items: [{ item: i("Beginner wand"), lvl: 45 },{ item: i("Master wand"), lvl: 60 },],
	parts: {precise: 3, head: 30, imbued: 2, base: 35, magic: 30},
  partQuantity: 8
};

export default Wand;
