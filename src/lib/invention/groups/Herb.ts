import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Herb: DisassemblySourceGroup = {
	name: 'Herb',
	items: [
		{ item: i('Grimy ardrigal'), lvl: 1 },
		{ item: i('Troll thistle'), lvl: 1 },
		{ item: i('Jute fibre'), lvl: 13 }
	],
	parts: {},
	partQuantity: 1
};

export default Herb;
