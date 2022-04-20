import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Claws: DisassemblySourceGroup = {
	name: 'Claws',
	items: [
		{ item: i('Bronze claws'), lvl: 1 },
		{ item: i('Iron claws'), lvl: 10 },
		{ item: i('Steel claws'), lvl: 20 },
		{ item: i('Mithril claws'), lvl: 30 },
		{ item: i('Rune claws'), lvl: 50 }
	],
	parts: { blade: 30, sharp: 30, swift: 2 }
};
