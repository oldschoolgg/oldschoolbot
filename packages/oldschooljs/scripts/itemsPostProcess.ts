import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { clone } from 'remeda';

import { unobtainableLeaguesItems } from '@/item-groups/unobtainable.js';
import _items from '../src/assets/item_data.json' with { type: 'json' };
import { ITEMS_TO_IGNORE_PRICES } from './util/misc.js';

const items = _items as Record<number, any>;
const ORIGINAL_ITEMS = clone(items);

for (const [_id, item] of Object.entries(items) as [string, any][]) {
	const id = Number(_id);
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

	if ([995].includes(id)) {
		item.price = 1;
	}

	if (id === 27840 || id === 27841) {
		item.equipment.attack_magic = 0;
	}
	delete item.wiki_name;
	delete item.equipable_by_player;
	delete item.equipable_weapon;
	delete item.incomplete;
	delete item.id;

	if (!item.price) {
		delete item.price;
	}
	if ([0, 1].includes(item.highalch) || !item.highalch) {
		delete item.highalch;
	}
	if ([0, 1].includes(item.lowalch) || !item.lowalch) {
		delete item.lowalch;
	}

	if (item.cost === 1 || ITEMS_TO_IGNORE_PRICES.includes(id)) {
		delete item.cost;
	}

	if (item.weapon?.stances) {
		delete item.weapon.stances;
	}
}

// Renames
const itemRenames = {
	30968: `Dragon egg (Scrambled)`
};
for (const [id, newName] of Object.entries(itemRenames)) {
	(items as any)[id as any].name = newName;
}

const didChange = JSON.stringify(ORIGINAL_ITEMS) !== JSON.stringify(items);
if (didChange) {
	writeFileSync('./src/assets/item_data.json', JSON.stringify(items, null, 4));
} else {
	console.log('No changes to item_data.json');
}

execSync('biome check --write --diagnostic-level=error', { stdio: 'inherit' });
