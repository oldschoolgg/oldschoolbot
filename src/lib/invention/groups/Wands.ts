import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Wands: DisassemblySourceGroup = {
	name: 'Wands',
	items: [
		{ item: i('Apprentice wand'), lvl: 50 },
		{ item: i('Teacher wand'), lvl: 55 }
	],
	parts: {},
	partQuantity: 8
};

export default Wands;
