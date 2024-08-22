import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const ThirdAge: DisassemblySourceGroup = {
	name: 'Third Age',
	items: [
		{
			item: [
				'3rd age pickaxe',
				'3rd age wand',
				'3rd age longsword',
				'3rd age axe',
				'3rd age cloak',
				'3rd age druidic robe bottoms',
				'3rd age druidic robe top',
				'3rd age mage hat',
				'3rd age range coif',
				'3rd age range top',
				'3rd age range legs',
				'3rd age vambraces',
				'3rd age kiteshield',
				'3rd age druidic staff',
				'3rd age full helmet',
				'3rd age platebody',
				'3rd age platelegs',
				'3rd age plateskirt',
				'3rd age robe',
				'3rd age robe top',
				'3rd age amulet',
				'3rd age bow',
				'3rd age druidic cloak',
				'Ring of 3rd age'
			].map(i),
			lvl: 99,
			flags: new Set(['third_age'])
		}
	],
	parts: { 'third-age': 100 }
};
