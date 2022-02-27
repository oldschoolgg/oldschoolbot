import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Cannonballs: DisassemblySourceGroup = {
	name: 'Cannonballs',
	items: [{ item: i("Cannonball"), lvl: 35 },],
	parts: {stunning: 3, head: 45, direct: 2, simple: 50},
  partQuantity: 8
};

export default Cannonballs;
