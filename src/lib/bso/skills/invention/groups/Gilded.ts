import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

import { Items } from 'oldschooljs';

const i = Items.getOrThrow.bind(Items);

export const Gilded: DisassemblySourceGroup = {
	name: 'Gilded',
	items: [
		{
			item: [
				'Gilded med helm',
				'Gilded chainbody',
				'Gilded pickaxe',
				'Gilded full helm',
				'Gilded plateskirt',
				"Gilded d'hide vambraces",
				'Gilded coif',
				'Gilded scimitar',
				'Gilded hasta',
				'Gilded sq shield',
				'Gilded kiteshield',
				'Gilded spade',
				'Gilded platebody',
				'Gilded boots',
				'Gilded spear',
				'Gilded platelegs',
				"Gilded d'hide chaps",
				'Gilded 2h sword',
				"Gilded d'hide body",
				'Gilded axe'
			].map(i),
			lvl: 99,
			flags: new Set(['treasure_trails'])
		}
	],
	parts: { gilded: 100 }
};
