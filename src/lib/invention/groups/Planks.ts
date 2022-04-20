import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Planks: DisassemblySourceGroup = {
	name: 'Planks',
	items: [
		{ item: i('Plank'), lvl: 1 },
		{ item: i('Oak plank'), lvl: 15 },
		{ item: i('Teak plank'), lvl: 35 },
		{ item: i('Mahogany plank'), lvl: 50 }
	],
	parts: { simple: 75 }
};
