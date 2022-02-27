import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MagicBody: DisassemblySourceGroup = {
	name: 'MagicBody',
	items: [{ item: i("Elemental helmet"), lvl: 1, special: { always: true, parts: [{ type: "harnessed", chance: 100, amount: 8 }, ] } },{ item: i("Zamorak robe top"), lvl: 1 },{ item: i("Splitbark body"), lvl: 40 },{ item: i("Enchanted top"), lvl: 45, special: { always: true, parts: [{ type: "fortunate", chance: 100, amount: 8 }, ] } },{ item: i("Skeletal top"), lvl: 50 },{ item: i("Infinity top"), lvl: 55 },{ item: i("Lunar torso"), lvl: 60 },{ item: i("Zuriel's robe top"), lvl: 78 },],
	parts: {},
  partQuantity: 8
};

export default MagicBody;
