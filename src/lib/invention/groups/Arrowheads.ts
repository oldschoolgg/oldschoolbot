import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Arrowheads: DisassemblySourceGroup = {
	name: 'Arrowheads',
	items: [
		{ item: i('Arrow shaft'), lvl: 1 },
		{ item: i('Headless arrow'), lvl: 1 },
		{ item: i('Broad arrowheads'), lvl: 25 }
	],
	parts: {},
	partQuantity: 2
};

export default Arrowheads;
