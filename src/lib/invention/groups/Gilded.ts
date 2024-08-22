import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

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
