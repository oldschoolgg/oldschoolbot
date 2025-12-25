import { writeFileSync } from 'node:fs';
import { sleep, Time } from '@oldschoolgg/toolkit';
// @ts-expect-error
import wtf from 'wtf_wikipedia';
import { scrapeItemWikiPage } from './scrape-item.js';
import { USELESS_ITEMS, checkItemVisibility, ItemVisibility, FullItem } from 'oldschooljs';

import moidData from './data/moid-items.json' with {type: 'json'};
import currentItemData from './data/full-items.json' with {type: 'json'};
import { MoidItem } from '@oldschoolgg/schemas';
import { saveDataFile } from './util.js';

function getInitial() {
	const moidItems = Object.entries(moidData.data).map((ent => ({ ...ent[1], id: Number(ent[0]) }))) as MoidItem[];
	const currentData = new Map(Object.entries(currentItemData.data).map(ent => ([Number(ent[0]), ent[1]])));
	console.log(`Total MOID items: ${moidItems.length}`);
	console.log(`Current data has ${currentData.size} items`);

	const itemsToProcess: MoidItem[] = [];
	for (const item of moidItems) {
		const visibility = checkItemVisibility(item);
		if (visibility === ItemVisibility.NeverAdd) continue;
		if (visibility === ItemVisibility.Unobtainable) continue;

		if (USELESS_ITEMS.includes(item.id)) continue;

		if (currentData.has(item.id)) {
			continue;
		}

		itemsToProcess.push(item);
	}
	return { itemsToProcess, currentData };
}

export const OSRS_WIKI_RATELIMIT = 350;
export const OSRS_WIKI_USER_AGENT = () => {
	return `Fetching All Items Once / discord[@magnaboy] ratelimit[${OSRS_WIKI_RATELIMIT}ms]`;
};

async function main() {
	const { itemsToProcess, currentData } = getInitial();

	console.log(`Items to process: ${itemsToProcess.length}`);
	writeFileSync('./items_to_process.json', JSON.stringify(itemsToProcess, null, 4));

	const newData: Record<string, FullItem> = {};
	for (const [id, item] of currentData.entries()) {
		const fullItem: FullItem = { ...(item) as FullItem, id: Number(id), visibility: checkItemVisibility(item as any) };
		newData[id] = fullItem;
	}

	const durations: number[] = [];

	for (let i = 0; i < itemsToProcess.length; i++) {
		const start = performance.now();
		await sleep(OSRS_WIKI_RATELIMIT);
		const moidItem = itemsToProcess[i];

		const newItem = await scrapeItemWikiPage(moidItem.id);

		if (typeof newItem === 'string') {
			console.log(`Failed to get item data for ${moidItem.name}[${moidItem.id}]: ${newItem}`);
			continue;
		}
		for (const item of newItem) {
			const fullItem: FullItem = { ...item, visibility: checkItemVisibility(item as any) };
			newData[item.id] = fullItem;
		}

		saveDataFile('full-items.json', (newData));
		const end = performance.now();
		const duration = end - start;
		durations.push(duration);
		const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
		const remaining = itemsToProcess.length - (i + 1);
		const timeLeft = (
			(remaining * avgDuration) /
			Time.Hour
		);
		console.log(
			`Processed ${moidItem.name}[${moidItem.id}] (${i + 1}/${itemsToProcess.length
			}) in ${duration.toFixed(2)}ms. Avg: ${avgDuration.toFixed(2)}ms. Est. time left: ${timeLeft.toFixed(2)}h (${remaining} items).`
		);
	}
}

main();
