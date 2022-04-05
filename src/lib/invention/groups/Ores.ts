import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Ores: DisassemblySourceGroup = {
	name: 'Ores',
	items: [
		{ item: i('Blurite ore'), lvl: 1, partQuantity: 1 },
		{ item: i('Clay'), lvl: 1, partQuantity: 1 },
		{ item: i('Copper ore'), lvl: 1, partQuantity: 1 },
		{ item: i('Tin ore'), lvl: 1, partQuantity: 1 },
		{ item: i('Iron ore'), lvl: 5, partQuantity: 1 },
		{ item: i('Coal'), lvl: 10, partQuantity: 1 },
		{ item: i('Silver ore'), lvl: 10, partQuantity: 1 },
		{ item: i('Mithril ore'), lvl: 15, partQuantity: 1 },
		{ item: i('Gold ore'), lvl: 20, partQuantity: 1 },
		{ item: i('Runite ore'), lvl: 25, partQuantity: 1 }
	],
	parts: { simple: 1 }
};

export default Ores;
