import { readFileSync, writeFileSync } from 'node:fs';
import type { StringifiedInteger } from '@oldschoolgg/schemas';
import { sleep } from '@oldschoolgg/toolkit';
import { toSortedSnakeCaseObject } from '@oldschoolgg/util';
import { checkItemVisibility, type FullItem, ItemVisibility, USELESS_ITEMS } from 'oldschooljs';
import { chunk } from 'remeda';

import { resolveItemName } from './item-names.js';
import { OSRSWikiAPI } from './osrs-wiki/api.js';
import { OSRS_WIKI_RATELIMIT, OSRS_WIKI_USER_AGENT } from './osrs-wiki/wiki.js';
import { type DataFileContent, saveDataFile, stripHtmlComments } from './util.js';

const currentItemData = JSON.parse(readFileSync('./src/data/full-items.json', 'utf-8')) as DataFileContent<
	Record<StringifiedInteger, FullItem>
>;
const currentData = new Map(Object.entries(currentItemData.data).map(ent => [Number(ent[0]), ent[1]]));

const moidData = JSON.parse(readFileSync('./src/data/moid-items.json', 'utf-8')) as DataFileContent<
	Record<StringifiedInteger, FullItem>
>;
const moidItems = Object.entries(moidData.data).map(ent => ({ ...ent[1], id: Number(ent[0]) }));
const moidItemMap = new Map(moidItems.map(i => [i.id, i]));

const SCRAPE_ONCE_NAMES = ['Pet cat', 'Overgrown cat', 'Wily cat', 'Kitten', 'Lazy cat'];

async function main() {
	const api = new OSRSWikiAPI({ userAgent: OSRS_WIKI_USER_AGENT(), throttleMs: 4000 });

	const itemsToProcess: (typeof moidItems)[0][] = [];
	for (const item of moidItems) {
		if (SCRAPE_ONCE_NAMES.includes(item.name) && itemsToProcess.some(_i => _i.name === item.name)) continue;
		const visibility = checkItemVisibility(item);
		if (visibility === ItemVisibility.NeverAdd) continue;

		const fi = currentData.get(item.id);
		if (fi) {
			if (['</span>', 'sic]', 'class=', '<sup'].some(str => fi.examine?.includes(str))) {
				itemsToProcess.push(item);
				continue;
			}
			if (fi.examine !== item.examine) {
				console.log(`${item.name}[${item.id}] OSRS[${item.examine}] Wiki[${fi.examine}]`);
				itemsToProcess.push(item);
				continue;
			}
			if (resolveItemName(item) === null && fi.name !== item.name) {
				console.log(`Name mismatch ID ${item.id}: MOID[${item.name}] FI[${fi.name}]`);
			}
			// if (fi.value !== item.value) {
			// 	console.log(`value mismatch ID ${item.id}: MOID[${item.value}] FI[${fi.value}]`);
			// 	itemsToProcess.push(item);
			// 	continue;
			// }
			// if (fi.members !== item.members && !fi.config_name.startsWith('br') && !fi.config_name.startsWith('dt2_') && !fi.config_name.startsWith('barbassault_') && !fi.config_name.startsWith('league')) {
			// 	console.log(`members mismatch ID ${item.name} [${item.id}]: MOID[${item.members}] FI[${fi.members}]`);
			// }
			// if (fi.noteable !== Boolean(item.noted_id)) {
			// 	console.log(`noteable mismatch ID ${item.id}`);
			// }
		}
		if (visibility === ItemVisibility.Unobtainable) continue;

		if (USELESS_ITEMS.includes(item.id)) continue;

		if (currentData.has(item.id)) {
			continue;
		}

		itemsToProcess.push(item);
	}

	console.log(`Items to process: ${itemsToProcess.length}`);
	writeFileSync('./items_to_process.json', JSON.stringify(itemsToProcess, null, 4));

	const newData: Record<string, FullItem> = {};
	for (const [id, item] of Array.from(currentData.entries()).sort((a, b) => Number(a[0]) - Number(b[0]))) {
		const moidItem = moidItemMap.get(id)!;
		if (!moidItem) throw new Error('no moid item');
		const fullItem: FullItem = { ...(item as FullItem), id: Number(id) };
		if (fullItem.id > 100_000 || !Number.isInteger(fullItem.id) || fullItem.id <= 0) {
			throw new Error(`Item ID found: ${fullItem.id} (${fullItem.name})`);
		}
		if (fullItem.destroy?.includes('<!--')) {
			fullItem.destroy = stripHtmlComments(fullItem.destroy);
		}
		if ('removalupdate' in fullItem) {
			throw new Error('item has removalupdate key');
		}
		if ('version' in fullItem) {
			delete fullItem.version;
		}

		// if ('equipment' in fullItem && 'version' in fullItem.equipment) {
		// 	delete fullItem.equipment.version;
		// }
		// if ('equipment' in fullItem && 'combatstyle' in fullItem.equipment) {
		// 	fullItem.equipment.combat_style = fullItem.equipment.combatstyle;
		// 	delete fullItem.equipment.combatstyle;
		// }

		for (const key of ['destroy', 'examine', 'removal_update'] as const) {
			if (!fullItem[key]) {
				delete fullItem[key];
			}
		}
		newData[id] = toSortedSnakeCaseObject(fullItem);
	}

	const processedIDs = new Set<number>();

	for (const list of chunk(itemsToProcess, 30)) {
		await sleep(OSRS_WIKI_RATELIMIT);

		console.log(`Fetching ${list.length} items`);
		const items = await api.pages.scrapeItemIds(list.map(i => i.id));

		for (const item of items) {
			processedIDs.add(item.id);
			if (Number.isNaN(item.id) || !Number.isInteger(item.id) || item.id <= 0 || item.id > 100_000) {
				console.log(`Skipping item with invalid ID: ${item.name} [${item.id}]`);
				continue;
			}
			const moidItem = moidItemMap.get(item.id)!;
			const fullItem: FullItem = {
				...item,
				name: resolveItemName(item) ?? item.name,
				config_name: moidItem!.config_name
			};
			newData[item.id] = fullItem;
		}
		saveDataFile('./full-items.json', newData);
	}
}

main();
