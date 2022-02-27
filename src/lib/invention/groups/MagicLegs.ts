import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MagicLegs: DisassemblySourceGroup = {
	name: 'MagicLegs',
	items: [{ item: i("Splitbark legs"), lvl: 40 },{ item: i("Enchanted robe"), lvl: 45, special: { always: true, parts: [{ type: "fortunate", chance: 100, amount: 8 }, ] } },{ item: i("Skeletal bottoms"), lvl: 50 },{ item: i("Infinity bottoms"), lvl: 55 },{ item: i("Lunar legs"), lvl: 60 },{ item: i("Zuriel's robe bottom"), lvl: 78 },],
	parts: {},
  partQuantity: 8
};

export default MagicLegs;
