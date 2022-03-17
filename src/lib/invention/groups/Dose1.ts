import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Dose1: DisassemblySourceGroup = {
	name: 'Dose1',
	items: [{ item: i('Vial of water'), lvl: 1, partQuantity: 1 }],
	parts: { delicate: 0, organic: 0, crafted: 0, enhancing: 0, healthy: 0 }
};

export default Dose1;
