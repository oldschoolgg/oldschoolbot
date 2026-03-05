import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

import { Items } from 'oldschooljs';

const i = Items.getOrThrow.bind(Items);

export const Gems: DisassemblySourceGroup = {
	name: 'Gems',
	items: [
		{ item: i('Opal'), lvl: 1 },
		{ item: i('Jade'), lvl: 13 },
		{ item: i('Red topaz'), lvl: 16 },
		{ item: i('Sapphire'), lvl: 20 },
		{ item: i('Emerald'), lvl: 27 },
		{ item: i('Ruby'), lvl: 34 },
		{ item: i('Diamond'), lvl: 43 },
		{ item: i('Dragonstone'), lvl: 55 },
		{ item: i('Onyx'), lvl: 67 },
		{ item: i('Zenyte'), lvl: 75 },
		{ item: i('Celestyte'), lvl: 78 },
		{ item: i('Starfire agate'), lvl: 81 },
		{ item: i('Verdantyte'), lvl: 84 },
		{ item: i('Oneiryte'), lvl: 87 },
		{ item: i('Firaxyte'), lvl: 90 },
		{ item: i('Prismare'), lvl: 99 }
	],
	parts: { precious: 60, smooth: 30 }
};
