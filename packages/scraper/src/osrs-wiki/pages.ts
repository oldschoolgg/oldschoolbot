import type { FullItem } from 'oldschooljs';

import { parseItemPage } from '../parser/infoboxes/infoboxes.js';
import { parse } from '../parser/parser.js';
import type { OSRSWikiAPI } from './api.js';

export class PagesAPI {
	constructor(private readonly client: OSRSWikiAPI) {}

	async scrapeItemIds(itemIds: number[]): Promise<FullItem[]> {
		const bucketResults = await this.client.buckets.item.fetchById(itemIds);

		const rawApiResponse = await this.client.wiki.request({
			action: 'query',
			titles: bucketResults.map(_b => _b.pageName).join('|'),
			prop: 'revisions|info|categories|pageimages|extracts',
			rvprop: 'content|timestamp|user|comment|ids',
			inprop: 'url|talkid',
			cllimit: 'max',
			pilimit: '1',
			exintro: '1',
			explaintext: '1',
			format: 'json',
			formatversion: '2',
			rvslots: 'main'
		});

		const results: FullItem[] = [];
		for (const page of (rawApiResponse as any).query.pages) {
			const content: string = page.revisions[0].slots.main.content;
			if (content.startsWith('#redirect')) {
				const target = content.replace('#redirect', '').trim().split('[').join('').split(']').join('').trim();
				console.log(`Redirecting to ${target}`);
				results.push(...(await this.scrapeItemPageByName(target)).items);
			}
			const items = parseItemPage(parse(content)).flat(100);
			results.push(...items);
		}
		return results;
	}

	async scrapeItemPageByName(itemIdOrName: number | string): Promise<{ items: FullItem[]; rawApiResponse: any }> {
		let itemName: string;
		if (typeof itemIdOrName === 'number') {
			const [bucketItem] = await this.client.buckets.item.fetchById(itemIdOrName);
			if (!bucketItem) {
				return { items: [], rawApiResponse: null };
			}
			itemName = bucketItem.pageName;
		} else {
			itemName = itemIdOrName;
		}

		const rawApiResponse = await this.client.wiki.request({
			action: 'query',
			titles: itemName,
			prop: 'revisions|info|categories|pageimages|extracts',
			rvprop: 'content|timestamp|user|comment|ids',
			inprop: 'url|talkid',
			cllimit: 'max',
			pilimit: '1',
			exintro: '1',
			explaintext: '1',
			format: 'json',
			formatversion: '2',
			rvslots: 'main'
		});
		const content: string = (rawApiResponse as any).query.pages[0].revisions[0].slots.main.content;
		if (content.startsWith('#redirect')) {
			const target = content.replace('#redirect', '').trim().split('[').join('').split(']').join('').trim();
			console.log(`Redirecting to ${target}`);
			return this.scrapeItemPageByName(target);
		}
		const items = parseItemPage(parse(content)).flat(100);
		return {
			items,
			rawApiResponse
		};
	}
}
