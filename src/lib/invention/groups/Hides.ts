import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Hides: DisassemblySourceGroup = {
	name: 'Hides',
	items: [{ item: i('Blue dragonhide'), lvl: 66, partQuantity: 1 }],
	parts: { simple: 0, living: 0 }
};

export default Hides;
