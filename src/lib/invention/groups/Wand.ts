import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Wand: DisassemblySourceGroup = {
	name: 'Wand',
	items: [
		{ item: i('Beginner wand'), lvl: 45, partQuantity: 8 },
		{ item: i('Master wand'), lvl: 60, partQuantity: 8 },
		{ item: i('Apprentice wand'), lvl: 50, partQuantity: 8 },
		{ item: i('Teacher wand'), lvl: 55, partQuantity: 8 }
	],
	parts: { precise: 3, head: 30, imbued: 2, base: 35, magic: 30 }
};

export default Wand;
