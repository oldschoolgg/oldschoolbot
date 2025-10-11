import { writeFileSync } from 'node:fs';

import { unobtainableLeaguesItems } from '@/item-groups/unobtainable.js';
import items from '../src/assets/item_data.json' with { type: 'json' };

for (const [_id, item] of Object.entries(items)) {
	if (unobtainableLeaguesItems.includes(item.id)) {
		item.tradeable = false;
		item.tradeable_on_ge = false;
		item.price = 0;
		if (item.equipment) {
			for (const key of Object.keys(item.equipment) as (keyof typeof item.equipment)[]) {
				if (typeof item.equipment[key] === 'number') {
					item.equipment[key] = 0;
				}
			}
		}
	}
}

writeFileSync('./src/assets/item_data.json', JSON.stringify(items, null, 4));
