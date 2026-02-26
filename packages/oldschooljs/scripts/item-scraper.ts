import { readFileSync, writeFileSync } from 'node:fs';
import { sleep } from '@oldschoolgg/toolkit';
// @ts-expect-error
import wtf from 'wtf_wikipedia';

import { type Item, Items } from '@/index.js';
import { USELESS_ITEMS } from '@/structures/ItemsClass.js';
import { pfetch } from './fetch.js';
import { ZWikiBucketItem } from './schemas.js';
import type { MoidSourceItem } from './types.js';
import { convertWikiJSONToItem } from './wikiparse.js';

async function fetchRes(url: string) {
	return pfetch(url, {
		cacheForSeconds: 600
	});
}

async function fetchMoidData() {
	const moidSource: MoidSourceItem[] = await fetchRes('https://chisel.weirdgloop.org/moid/data_files/itemsmin.js')
		.then(res => res.text())
		.then(txt => JSON.parse(txt.replace('items=', '')));
	const moidSourceMap = new Map<number, (typeof moidSource)[0]>();
	moidSource.forEach(i => {
		moidSourceMap.set(i.id, i);
	});
	return { moidSource, moidSourceMap };
}

async function fetchItemWikiPage(itemId: number): Promise<Item | null> {
	const params = [
		'item_id',
		'item_name',
		'page_name',
		'is_members_only',
		'high_alchemy_value',
		'league_region',
		'release_date',
		'value',
		'weight',
		'buy_limit',
		'examine'
	];
	const res: any = await fetchRes(
		`https://oldschool.runescape.wiki/api.php?action=bucket&query=bucket('infobox_item').select(${encodeURIComponent(params.map(i => `'${i}'`).join(','))}).where('item_id','${itemId}').run()&format=json`
	).then(res => res.json());
	const rawData = res.bucket[0] as any;
	if (!rawData) return null;
	const dataFromBucket = ZWikiBucketItem.parse({ ...rawData, is_members_only: rawData.is_members_only === true });

	const rawPageContents = await fetchRes(
		`https://oldschool.runescape.wiki/api.php?action=query&titles=${encodeURIComponent(dataFromBucket.page_name)}&prop=revisions&rvprop=content&formatversion=2&format=json`
	)
		.then(res => res.json())
		.then((data: any) => data.query.pages.map((page: any) => page.revisions[0].content));
	const asdf = wtf(rawPageContents[0]).json();
	const itemFromInfoBox = convertWikiJSONToItem(asdf);
	if (itemFromInfoBox === null) return null;

	const finalItem: Item = {
		id: itemId,
		name: itemFromInfoBox.name,
		members: dataFromBucket.is_members_only ? true : undefined,
		tradeable: itemFromInfoBox.tradeable,
		tradeable_on_ge: itemFromInfoBox.tradeable_on_ge,
		equipable: itemFromInfoBox.equipable,
		highalch: dataFromBucket.high_alchemy_value,
		equipment: itemFromInfoBox.equipment,
		cost: dataFromBucket.value,
		buy_limit: dataFromBucket.buy_limit
	};
	return finalItem;
}

async function main() {
	const currentData = JSON.parse(await readFileSync('./src/assets/item_data.json', 'utf-8'));
	const existingItemIDsMap = new Map(Object.keys(currentData).map(n => [Number(n), currentData[n]]));

	const { moidSource } = await fetchMoidData();

	const itemIdsToProcess: number[] = [];
	for (const item of moidSource) {
		if (item.id < 10_000) continue;
		if (existingItemIDsMap.has(item.id)) continue;
		if (item.name.trim().length === 0) continue;
		if (item.name.toLowerCase() === 'null') continue;

		if (['_riddle', '_skillguide_'].some(suffix => item.configName.toLowerCase().includes(suffix))) continue;
		if (
			[
				'placeholder_',
				'lost_schematic_',
				'beta_',
				'br_',
				'fake_',
				'cert_',
				'poh_',
				'raids_storage',
				'bas_puzzle_',
				'con_contract_',
				'slayerguide_',
				'nzone_',
				'pvpa_'
			].some(suffix => item.configName.toLowerCase().startsWith(suffix))
		)
			continue;
		if (['_worn', '_dummy'].some(suffix => item.configName.toLowerCase().endsWith(suffix))) continue;
		if (
			['clue scroll', 'challenge scroll', 'casket', 'puzzle box', 'armour set'].some(str =>
				item.name.toLowerCase().includes(str)
			)
		)
			continue;
		if (USELESS_ITEMS.includes(item.id)) continue;
		if (Items.has(item.id)) continue;
		if (Items.getItem(item.name)) continue;
		itemIdsToProcess.push(item.id);
	}

	console.log(`Items to process: ${itemIdsToProcess.length}`);

	const newData = { ...currentData };

	for (let i = 0; i < itemIdsToProcess.length; i++) {
		await sleep(555);
		const newItem = await fetchItemWikiPage(itemIdsToProcess[i]);
		if (newItem === null) continue;
		newData[itemIdsToProcess[i]] = newItem;
		writeFileSync('./src/assets/item_data.json', JSON.stringify(newData, null, 4));
	}
}

main();
