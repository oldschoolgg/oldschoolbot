import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Planks: DisassemblySourceGroup = {
	name: 'Planks',
	items: [
		{ item: i('Plank'), lvl: 1 },
		{ item: i('Oak plank'), lvl: 15 },
		{ item: i('Teak plank'), lvl: 35 },
		{ item: i('Mahogany plank'), lvl: 50 },
		{ item: i('Elder plank'), lvl: 99 }
	],
	parts: { organic: 50, base: 25, simple: 25 }
};
