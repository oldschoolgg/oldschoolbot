import { writeFileSync } from 'node:fs';
import { clone } from 'remeda';

import { unobtainableLeaguesItems } from '@/item-groups/unobtainable.js';
import items from '../src/assets/item_data.json' with { type: 'json' };

const itemsCopy = clone(items);

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
	if (item.id === 27840 || item.id === 27841) {
		item.equipment.attack_magic = 0;
	}
}

// Renames
const itemRenames = {
	30968: `Dragon egg (Scrambled)`
};
for (const [id, newName] of Object.entries(itemRenames)) {
	(items as any)[id as any].name = newName;
}

const didChange = JSON.stringify(itemsCopy) !== JSON.stringify(items);
if (didChange) {
	writeFileSync('./src/assets/item_data.json', JSON.stringify(items, null, 4));
}
