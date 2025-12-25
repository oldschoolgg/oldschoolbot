import { ZWikiBucketItem } from "@oldschoolgg/schemas";
import { pfetch } from "@oldschoolgg/toolkit/node";
import { writeFileSync } from "node:fs";
// @ts-expect-error
import wtf from "wtf_wikipedia";

import { convertWikiJSONToItem } from "./wikiparse.js";
import { OSRS_WIKI_USER_AGENT } from "./item-scraper.js";

type RawWikiResponse = {
	batchcomplete: boolean
	warnings: {
		main: {
			warnings: string
		}
		revisions: {
			warnings: string
		}
	}
	query: {
		pages: Array<{
			pageid: number
			ns: number
			title: string
			revisions: Array<{
				revid: number
				parentid: number
				user: string
				timestamp: string
				contentformat: string
				contentmodel: string
				content: string
				comment: string
			}>
			contentmodel: string
			pagelanguage: string
			pagelanguagehtmlcode: string
			pagelanguagedir: string
			touched: string
			lastrevid: number
			length: number
			talkid: number
			fullurl: string
			editurl: string
			canonicalurl: string
			categories: Array<{
				ns: number
				title: string
			}>
			thumbnail: {
				source: string
				width: number
				height: number
			}
			pageimage: string
			extract: string
		}>
	}
	limits: {
		categories: number
	}
}


export async function scrapeItemWikiPage(itemId: number) {
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
			cacheForSeconds: 60 * 60 * 24,
			headers: {
				'User-Agent': OSRS_WIKI_USER_AGENT()
			}
		}
	).then(res => res.json());
	const rawData = res.bucket[0] as any;
	if (!rawData) return 'missing bucket data';
	const dataFromBucket = ZWikiBucketItem.parse({ ...rawData, is_members_only: 'is_members_only' in rawData });
	writeFileSync(
		`./cache/bucket/${itemId}.json`,
		JSON.stringify(
			dataFromBucket,
			null,
			4
		)
	);

	const wikiUrl = new URL("https://oldschool.runescape.wiki/api.php");
	wikiUrl.search = new URLSearchParams({
		action: "query",
		titles: dataFromBucket.page_name,
		prop: "revisions|info|categories|pageimages|extracts",
		rvprop: "content|timestamp|user|comment|ids",
		inprop: "url|talkid",
		cllimit: "max",
		pilimit: "1",
		exintro: "1",
		explaintext: "1",
		format: "json",
		formatversion: "2",
		rvslots: "main"
	}).toString();
	const rawPageContents: RawWikiResponse = await pfetch(
		wikiUrl.toString(),
		{
			cacheForSeconds: 60 * 60 * 24,
			headers: {
				'User-Agent': OSRS_WIKI_USER_AGENT()
			}
		}
	)
		.then(res => res.json() as any as RawWikiResponse);

	writeFileSync(
		`./cache/wikiraw/${itemId}.json`,
		JSON.stringify(
			rawPageContents,
			null,
			4
		)
	);
	// @ts-expect-error
	const infobox = rawPageContents.query.pages[0].revisions[0].slots.main.content;
	const rawWikiData = wtf(infobox).json();

	const itemsFromInfoBox = convertWikiJSONToItem(rawWikiData);

	if (itemsFromInfoBox === null) return 'missing infobox data';

	const finalItems = itemsFromInfoBox.map(itemFromInfoBox => ({
		highalch: dataFromBucket.high_alchemy_value,
		buy_limit: dataFromBucket.buy_limit,
		weight: dataFromBucket.weight,
		examine: dataFromBucket.examine,
		...itemFromInfoBox,
		cost: dataFromBucket.value ?? itemFromInfoBox.cost,
	} as const));
	return finalItems;
}
