import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Ashes: DisassemblySourceGroup = {
	name: 'Ashes',
	items: [{ item: i('Infernal ashes'), lvl: 25, partQuantity: 2 }],
	parts: { pious: 1, ethereal: 1, organic: 98 }
};

export default Ashes;
