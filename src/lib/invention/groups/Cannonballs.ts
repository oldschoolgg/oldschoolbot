import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Cannonballs: DisassemblySourceGroup = {
	name: 'Cannonballs',
	items: [{ item: i('Cannonball'), lvl: 35, partQuantity: 8 }],
	parts: { stunning: 3, head: 45, direct: 2, simple: 50 }
};

export default Cannonballs;
