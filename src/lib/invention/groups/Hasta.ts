import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Hasta: DisassemblySourceGroup = {
	name: 'Hasta',
	items: [
		{ item: i('Bronze hasta'), lvl: 1 },
		{ item: i('Iron hasta'), lvl: 10 },
		{ item: i('Steel hasta'), lvl: 20 },
		{ item: i('Mithril hasta'), lvl: 30 },
		{ item: i('Rune hasta'), lvl: 50 },
		{ item: i('Dragon hasta'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i('Zamorakian hasta'), lvl: 70 }
	],
	parts: { sharp: 30, heavy: 10 }
};
