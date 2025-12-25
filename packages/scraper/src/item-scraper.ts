import { clone } from 'remeda';
import { writeFileSync } from 'node:fs';
import { sleep } from '@oldschoolgg/toolkit';
// @ts-expect-error
import wtf from 'wtf_wikipedia';
import type { MoidItem } from './types.js';
import { scrapeItemWikiPage } from './scrape-item.js';
import { USELESS_ITEMS, Items, checkItemVisibility, ItemVisibility } from 'oldschooljs';

import moidData from './data/moid-items.json' with {type: 'json'};
import currentItemData from '../../oldschooljs/src/assets/item_data.json' with {type: 'json'};

async function main() {
	const moidItems = Object.entries(moidData.data).map((ent => ({ ...ent[1], id: Number(ent[0]) }))) as MoidItem[];
	const currentData = new Map(Object.entries(currentItemData).map(ent => ([Number(ent[0]), ent[1]])));

	const itemIdsToProcess: MoidItem[] = [];
	for (const item of moidItems) {
		const visibility = checkItemVisibility(item);
		if (visibility === ItemVisibility.NeverAdd) continue;
		if (item.id < 10_000) continue;

		if (USELESS_ITEMS.includes(item.id)) continue;

		if (Items.has(item.id) || Items.getItem(item.name) || currentData.has(item.id)) {
			continue;
		}

		itemIdsToProcess.push(item);
	}

	console.log(`Items to process: ${itemIdsToProcess.length}`);
	writeFileSync('./items_to_process.json', JSON.stringify(itemIdsToProcess, null, 4));

	const newData = clone(currentData);

	for (let i = 0; i < itemIdsToProcess.length; i++) {
		const item = itemIdsToProcess[i];
		await sleep(555);
		const newItem = await scrapeItemWikiPage(item.id);
		if (typeof newItem === 'string') {
			console.log(`Failed to get item data for ${item.name}[${item.id}]: ${newItem}`);
			continue;
		}
		for (const item of newItem) {
			newData.set(item.id, { ...item, visibility: checkItemVisibility(item) });
		}
		writeFileSync('./src/assets/item_data.json', JSON.stringify(newData, null, 4));
	}
}

main();
