import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Hides: DisassemblySourceGroup = {
	name: 'Hides',
	items: [{ item: i('Blue dragonhide'), lvl: 66, partQuantity: 1 }],
	parts: { simple: 99, living: 1 }
};

export default Hides;
