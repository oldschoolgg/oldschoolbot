import { Items } from 'oldschooljs';

import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

const i = Items.getOrThrow.bind(Items);

export const MysteryBoxes: DisassemblySourceGroup = {
	name: 'Mystery Boxes',
	description: 'Mystery boxes!',
	items: [
		{ item: i('Tradeable Mystery box'), lvl: 99 },
		{ item: i('Untradeable Mystery box'), lvl: 99 },
		{ item: i('Equippable Mystery box'), lvl: 99 },
		{ item: i('Clothing Mystery box'), lvl: 99 },
		{ item: i('Pet Mystery box'), lvl: 99 }
	],
	parts: { mysterious: 100 }
};
