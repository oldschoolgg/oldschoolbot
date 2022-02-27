import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Jewelry: DisassemblySourceGroup = {
	name: 'Jewelry',
	items: [{ item: i('Pre-nature amulet'), lvl: 8 }],
	parts: {},
	partQuantity: 5
};

export default Jewelry;
