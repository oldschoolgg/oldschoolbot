import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const RangedBoots: DisassemblySourceGroup = {
	name: 'RangedBoots',
	items: [{ item: i("Ranger boots"), lvl: 40, special: { always: true, parts: [{ type: "fortunate", chance: 100, amount: 4 }, ] } },{ item: i("Spined boots"), lvl: 50 },],
	parts: {},
  partQuantity: 4
};

export default RangedBoots;
