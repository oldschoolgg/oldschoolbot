import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Herb: DisassemblySourceGroup = {
	name: 'Herb',
	items: [
		{ item: i('Grimy ardrigal'), lvl: 1, partQuantity: 1 },
		{ item: i('Troll thistle'), lvl: 1, partQuantity: 1 },
		{ item: i('Jute fibre'), lvl: 13, partQuantity: 1 },
		{ item: i('Nasturtiums'), lvl: 25, partQuantity: 1 }
	],
	parts: { organic: 89, crafted: 8, living: 1, healthy: 1, enhancing: 1 }
};

export default Herb;
