import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Planks: DisassemblySourceGroup = {
	name: 'Planks',
	items: [
		{ item: i('Plank'), lvl: 1 },
		{ item: i('Oak plank'), lvl: 15 },
		{ item: i('Bat wing'), lvl: 30 },
		{ item: i('Teak plank'), lvl: 35 },
		{ item: i('Cured yak-hide'), lvl: 43 },
		{ item: i('Snakeskin'), lvl: 45 },
		{ item: i('Mahogany plank'), lvl: 50 },
		{ item: i('Red dragon leather'), lvl: 73 },
		{ item: i('Black dragon leather'), lvl: 79 }
	],
	parts: { simple: 75, crafted: 25 },
	partQuantity: 1
};

export default Planks;
