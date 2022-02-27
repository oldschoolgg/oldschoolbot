import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Ranged4: DisassemblySourceGroup = {
	name: 'Ranged4',
	items: [{ item: i("Runner boots"), lvl: 50 },],
	parts: {},
  partQuantity: 4
};

export default Ranged4;
