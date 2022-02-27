import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const HybridLegs: DisassemblySourceGroup = {
	name: 'HybridLegs',
	items: [{ item: i("Obsidian platelegs"), lvl: 60 },{ item: i("Crystal legs"), lvl: 70, special: { always: true, parts: [{ type: "crystal", chance: 74, amount: 8 }, { type: "seren", chance: 13, amount: 1 }, { type: "faceted", chance: 13, amount: 1 }, ] } },],
	parts: {},
  partQuantity: 8
};

export default HybridLegs;
