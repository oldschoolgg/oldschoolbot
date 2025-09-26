import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

import { Items } from 'oldschooljs';

const i = Items.getOrThrow.bind(Items);

export const Explosive: DisassemblySourceGroup = {
	name: 'Explosive',
	items: [
		{ item: i('Red chinchompa'), lvl: 75 },
		{ item: i('Black chinchompa'), lvl: 90 }
	],
	parts: { explosive: 90, organic: 10 }
};
