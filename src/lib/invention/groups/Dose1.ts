import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Dose1: DisassemblySourceGroup = {
	name: 'Dose1',
	items: [{ item: i('Vial of water'), lvl: 1 }],
	parts: {},
	partQuantity: 1
};

export default Dose1;
