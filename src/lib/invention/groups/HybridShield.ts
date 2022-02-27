import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const HybridShield: DisassemblySourceGroup = {
	name: 'HybridShield',
	items: [{ item: i("Mirror shield"), lvl: 25 },],
	parts: {},
  partQuantity: 8
};

export default HybridShield;
