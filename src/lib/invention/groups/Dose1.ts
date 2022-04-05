import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Dose1: DisassemblySourceGroup = {
	name: 'Dose1',
	items: [{ item: i('Vial of water'), lvl: 1, partQuantity: 1 }],
	parts: { delicate: 35, organic: 32, crafted: 30, enhancing: 3, healthy: 1 }
};

export default Dose1;
