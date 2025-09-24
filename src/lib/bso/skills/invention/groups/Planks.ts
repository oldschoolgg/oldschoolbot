import { Items } from 'oldschooljs';

import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

const i = Items.getOrThrow.bind(Items);

export const Planks: DisassemblySourceGroup = {
	name: 'Planks',
	items: [
		{ item: i('Plank'), lvl: 20 },
		{ item: i('Oak plank'), lvl: 40 },
		{ item: i('Teak plank'), lvl: 80 },
		{ item: i('Mahogany plank'), lvl: 90 },
		{ item: i('Elder plank'), lvl: 99 }
	],
	parts: { wooden: 100 }
};
