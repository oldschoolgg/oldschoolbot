import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Planks: DisassemblySourceGroup = {
	name: 'Planks',
	items: [
		{ item: i('Plank'), lvl: 1, partQuantity: 1 },
		{ item: i('Oak plank'), lvl: 15, partQuantity: 1 },
		{ item: i('Teak plank'), lvl: 35, partQuantity: 1 },
		{ item: i('Cured yak-hide'), lvl: 43, partQuantity: 1 },
		{ item: i('Snakeskin'), lvl: 45, partQuantity: 1 },
		{ item: i('Mahogany plank'), lvl: 50, partQuantity: 1 },
		{ item: i('Red dragon leather'), lvl: 73, partQuantity: 1 },
		{ item: i('Black dragon leather'), lvl: 79, partQuantity: 1 }
	],
	parts: { simple: 75, crafted: 25 }
};

export default Planks;
