import { pfetch } from "@oldschoolgg/toolkit/node";
import { writeFileSync } from "node:fs";
import { Item } from "oldschooljs";
// @ts-expect-error
import wtf from "wtf_wikipedia";

import { convertWikiJSONToItem } from "./wikiparse.js";
import { ZWikiBucketItem } from "./types.js";

export async function scrapeItemWikiPage(itemId: number): Promise<Item[] | string> {
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
	const res: any = await pfetch(
		`https://oldschool.runescape.wiki/api.php?action=bucket&query=bucket('infobox_item').select(${encodeURIComponent(params.map(i => `'${i}'`).join(','))}).where('item_id','${itemId}').run()&format=json`,
		{
			cacheForSeconds: 60 * 60 * 24
		}
	).then(res => res.json());
	const rawData = res.bucket[0] as any;
	if (!rawData) return 'missing bucket data';
	const dataFromBucket = ZWikiBucketItem.parse({ ...rawData, is_members_only: 'is_members_only' in rawData });

	const rawPageContents = await pfetch(
		`https://oldschool.runescape.wiki/api.php?action=query&titles=${encodeURIComponent(dataFromBucket.page_name)}&prop=revisions&rvprop=content&formatversion=2&format=json`,
		{
			cacheForSeconds: 60 * 60 * 24
		}
	)
		.then(res => res.json())
		.then((data: any) => data.query.pages.map((page: any) => page.revisions[0].content));
	const rawWikiData = wtf(rawPageContents[0]).json();

	const itemsFromInfoBox = convertWikiJSONToItem(rawWikiData);
	if (itemsFromInfoBox === null) return 'missing infobox data';
	writeFileSync(
		`./tmp/${itemId}.json`,
		JSON.stringify(
			{
				data_from_bucket: dataFromBucket,
				raw_wiki_data: rawWikiData,
				infobox_items: itemsFromInfoBox
			},
			null,
			4
		)
	);

	// Handle multiple item versions (e.g., empty/charged variants)
	const finalItems: Item[] = itemsFromInfoBox.map(itemFromInfoBox => ({
		id: itemFromInfoBox.id,
		name: itemFromInfoBox.name,
		members: dataFromBucket.is_members_only ? true : undefined,
		tradeable: itemFromInfoBox.tradeable,
		tradeable_on_ge: itemFromInfoBox.tradeable_on_ge,
		equipable: itemFromInfoBox.equipable,
		highalch: dataFromBucket.high_alchemy_value,
		equipment: itemFromInfoBox.equipment,
		cost: dataFromBucket.value,
		buy_limit: dataFromBucket.buy_limit
	}));
	return finalItems;
}
