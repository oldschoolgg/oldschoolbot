import { setCustomItem } from '@/lib/customItems/util.js';
import type { CustomItemData } from '@/lib/data/itemAliases.js';
import summoningCustomItems from './summoning.json' with { type: 'json' };

for (const item of Object.values(summoningCustomItems)) {
	setCustomItem(item.id, item.name, 'Coal', {
		customItemData: item.customItemData as CustomItemData
	});
}
