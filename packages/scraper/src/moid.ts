import type { MoidSourceItem } from '@oldschoolgg/schemas';
import { pfetch } from '@oldschoolgg/toolkit/node';
import { objectToSnakeCase } from '@oldschoolgg/util';

import { saveDataFile } from './util.js';

async function fetchMoidData() {
	const moidSource = (
		await pfetch('https://chisel.weirdgloop.org/moid/data_files/itemsmin.js', {
			cacheForSeconds: 60 * 60 * 24 // 24 hours
		})
			.then(res => res.text())
			.then(txt => JSON.parse(txt.replace('items=', '')))
	)
		.filter(
			(item: MoidSourceItem) => item.id !== 0 && item.name.toLowerCase() !== 'null' && item.name.trim().length > 0
		)
		.sort((a: MoidSourceItem, b: MoidSourceItem) => a.id - b.id)
		.map((_item: MoidSourceItem) => {
			const item: any = objectToSnakeCase(_item);
			if (![0, 1].includes(item.stackable)) {
				throw new Error(`Unexpected stackable value for item ID ${item.id}: ${item.stackable}`);
			}

			// Nullable keys
			for (const key of ['placeholder_id', 'noted_id']) {
				if (item[key] === -1) {
					item[key] = null;
				}
			}

			// Boolean keys
			for (const key of ['stackable']) {
				item[key] = item[key] === 1;
			}

			return objectToSnakeCase({
				...item
			});
		});

	const obj: any = {};
	for (const item of moidSource) {
		obj[item.id] = item;
	}
	saveDataFile('moid-items.json', obj);
}

fetchMoidData();
