import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Arrowheads: DisassemblySourceGroup = {
	name: 'Arrowheads',
	items: [
		{ item: i('Arrow shaft'), lvl: 1, partQuantity: 2 },
		{ item: i('Headless arrow'), lvl: 1, partQuantity: 2 },
		{ item: i('Broad arrowheads'), lvl: 25, partQuantity: 2 }
	],
	parts: { stave: 40, head: 30, crafted: 27, precise: 3 }
};

export default Arrowheads;
