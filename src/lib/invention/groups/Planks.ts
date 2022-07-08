import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Planks: DisassemblySourceGroup = {
	name: 'Planks',
	items: [
		{ item: i('Plank'), lvl: 20 },
		{ item: i('Oak plank'), lvl: 40 },
		{ item: i('Teak plank'), lvl: 80 },
		{ item: i('Mahogany plank'), lvl: 90 },
		{ item: i('Elder plank'), lvl: 99 }
	],
	parts: { organic: 50, base: 25, simple: 25 }
};
