import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Wand: DisassemblySourceGroup = {
	name: 'Wand',
	items: [
		{ item: i('Beginner wand'), lvl: 45 },
		{ item: i('Apprentice wand'), lvl: 50 },
		{ item: i('Teacher wand'), lvl: 55 },
		{ item: i('Master wand'), lvl: 60 },
		{ item: i('3rd age wand'), lvl: 65 }
	],
	parts: { imbued: 2, base: 35, magic: 30 }
};
