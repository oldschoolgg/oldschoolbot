import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const HybridBoots: DisassemblySourceGroup = {
	name: 'HybridBoots',
	items: [{ item: i("Dragonstone boots"), lvl: 50 },],
	parts: {},
  partQuantity: 4
};

export default HybridBoots;
