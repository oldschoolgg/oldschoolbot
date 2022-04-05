import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Clockwork: DisassemblySourceGroup = {
	name: 'Clockwork',
	items: [
		{ item: i('Clockwork'), lvl: 1, partQuantity: 1 },
		{ item: i('Toy doll'), lvl: 1, partQuantity: 1 },
		{ item: i('Toy doll (wound)'), lvl: 1, partQuantity: 1 },
		{ item: i('Toy mouse'), lvl: 1, partQuantity: 1 },
		{ item: i('Toy mouse (wound)'), lvl: 1, partQuantity: 1 },
		{ item: i('Toy soldier'), lvl: 1, partQuantity: 1 },
		{ item: i('Toy soldier (wound)'), lvl: 1, partQuantity: 1 }
	],
	parts: { clockwork: 2, crafted: 17, simple: 76 }
};

export default Clockwork;
