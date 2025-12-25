import { MoidItem } from "@oldschoolgg/schemas";
import { pfetch } from "@oldschoolgg/toolkit/node";
import { writeFileSync } from "node:fs";
// @ts-expect-error
import wtf from "wtf_wikipedia";

import { convertWikiJSONToItem } from "./wikiparse.js";
import { OSRS_WIKI_USER_AGENT } from "./item-scraper.js";

function buildWikiUrl(itemName: string) {
	const wikiUrl = new URL("https://oldschool.runescape.wiki/api.php");
	wikiUrl.search = new URLSearchParams({
		action: "query",
		titles: itemName,
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
	return wikiUrl.toString();
}

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


export async function scrapeItemWikiPage(item: MoidItem) {
	console.log(`scrapeItemWikiPage ${item.name}[${item.id}]`);
	// const params = [
	// 	'item_id',
	// 	'item_name',
	// 	'page_name',
	// 	'is_members_only',
	// 	'high_alchemy_value',
	// 	'league_region',
	// 	'release_date',
	// 	'value',
	// 	'weight',
	// 	'buy_limit',
	// 	'examine'
	// ];

	// const res: any = await pfetch(
	// 	`https://oldschool.runescape.wiki/api.php?action=bucket&query=bucket('infobox_item').select(${encodeURIComponent(params.map(i => `'${i}'`).join(','))}).where('item_id','${item.id}').run()&format=json`,
	// 	{
	// 		cacheForSeconds: 60 * 60 * 24,
	// 		headers: {
	// 			'User-Agent': OSRS_WIKI_USER_AGENT()
	// 		}
	// 	}
	// ).then(res => res.json());
	// const rawData = res.bucket[0] as any;
	// if (!rawData) return 'missing bucket data';
	// const dataFromBucketR = ZWikiBucketItem.safeParse({ ...rawData, is_members_only: 'is_members_only' in rawData });
	// if (!dataFromBucketR.success) {
	// 	return `invalid bucket data for ${item.id}: ${JSON.stringify(dataFromBucketR.error.issues)}`;
	// }
	// const dataFromBucket = dataFromBucketR.data;
	// writeFileSync(
	// 	`./cache/bucket/${item.id}.json`,
	// 	JSON.stringify(
	// 		dataFromBucket,
	// 		null,
	// 		4
	// 	)
	// );
	const wikiUrl = (buildWikiUrl(item.name));

	let rawPageContents: RawWikiResponse = await pfetch(
		wikiUrl,
		{
			cacheForSeconds: 60 * 60 * 24,
			headers: {
				'User-Agent': OSRS_WIKI_USER_AGENT()
			}
		}
	)
		.then(res => res.json() as any as RawWikiResponse);

	// @ts-expect-error
	const content: string = rawPageContents.query.pages[0].revisions[0].slots.main.content;
	if (content.startsWith('#REDIRECT')) {
		console.log(`	Item ${item.name} is a redirect, fetching actual page...`);
		rawPageContents = await pfetch(
			buildWikiUrl(content.replace('#REDIRECT', '').trim().split('[').join('').split(']').join('').trim()),
			{
				cacheForSeconds: 60 * 60 * 24,
				headers: {
					'User-Agent': OSRS_WIKI_USER_AGENT()
				}
			}
		)
			.then(res => res.json() as any as RawWikiResponse);
	}

	writeFileSync(
		`./cache/wikiraw/${item.id}.json`,
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
	if (typeof itemsFromInfoBox === 'string') return itemsFromInfoBox;

	const finalItems = itemsFromInfoBox.map(itemFromInfoBox => {
		const value = itemFromInfoBox.value;
		return ({
			...itemFromInfoBox,
			value,
		})
	});
	return finalItems;
}
