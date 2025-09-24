import { Items } from 'oldschooljs';

import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

const i = Items.getOrThrow.bind(Items);

export const Longsword: DisassemblySourceGroup = {
	name: 'Longsword',
	items: [
		{ item: i('Bronze longsword'), lvl: 1 },
		{ item: i('Iron longsword'), lvl: 10 },
		{ item: i('Steel longsword'), lvl: 20 },
		{
			item: i('Black longsword'),
			lvl: 25
		},
		{ item: i('Mithril longsword'), lvl: 30 },
		{ item: i('Adamant longsword'), lvl: 40 },
		{ item: i('Rune longsword'), lvl: 50 },
		{ item: i('Dragon longsword'), lvl: 60, flags: new Set(['orikalkum']) },
		{ item: i("Vesta's longsword"), lvl: 78 }
	],
	parts: { sharp: 30, metallic: 30, base: 10, dextrous: 5 }
};
