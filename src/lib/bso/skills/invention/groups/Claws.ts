import { Items } from 'oldschooljs';

import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

const i = Items.getOrThrow.bind(Items);

export const Claws: DisassemblySourceGroup = {
	name: 'Claws',
	items: [
		{ item: i('Bronze claws'), lvl: 1 },
		{ item: i('Iron claws'), lvl: 10 },
		{ item: i('Steel claws'), lvl: 20 },
		{ item: i('Mithril claws'), lvl: 30 },
		{ item: i('Adamant claws'), lvl: 40 },
		{ item: i('Rune claws'), lvl: 50 },
		{ item: i('Dragon claws'), lvl: 99, flags: new Set(['orikalkum']) }
	],
	parts: { sharp: 60, swift: 40 }
};
