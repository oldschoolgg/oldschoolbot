import type { StringifiedInteger } from '@oldschoolgg/schemas';
import { toSortedSnakeCaseObject } from '@oldschoolgg/util';
import { readFileSync } from 'fs';
import { omit } from 'remeda';

import { type DataFileContent, saveDataFile } from '../util.js';
import {
	type ICatalogueItem,
	type ICatalogueItemsResponse,
	ZCatalogueItemSchema,
	ZCatalogueItemsResponseSchema
} from './types.js';

const currentItemData = JSON.parse(readFileSync('./src/data/os-catalogue.json', 'utf-8')) as DataFileContent<
	Record<StringifiedInteger, ICatalogueItem>
>;
const BASE_URL = 'https://secure.runescape.com/m=itemdb_oldschool/api/catalogue/items.json';
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

async function fetchPage(category: number, alpha: string, page: number): Promise<ICatalogueItemsResponse> {
	const url = `${BASE_URL}?category=${category}&alpha=${alpha}&page=${page}`;
	console.log(`Fetching: ${url}`);

	const MAX_RETRIES = 3;
	const WAIT_TIME_MS = 2500;
	let lastError: any;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			const text = await fetch(url).then(res => res.text());
			const res = JSON.parse(text);
			return ZCatalogueItemsResponseSchema.parse(res);
		} catch (err) {
			lastError = err;
			console.error(`Attempt ${attempt}/${MAX_RETRIES} failed for URL: ${url}`);

			if (attempt < MAX_RETRIES) {
				const waitTime = WAIT_TIME_MS * attempt;
				console.log(`Retrying in ${waitTime}ms...`);
				await new Promise(resolve => setTimeout(resolve, waitTime));
			}
		}
	}

	console.error(`All ${MAX_RETRIES} attempts failed for URL: ${url}`);
	throw lastError;
}

const output: Record<string, ICatalogueItem> = {};

for (const x of Object.values(currentItemData.data)) {
	output[x.id] = ZCatalogueItemSchema.parse(x);
}

async function scrapeAll(category: number): Promise<void> {
	for (const alpha of ALPHABET) {
		let page = 1;
		while (true) {
			const data = await fetchPage(category, alpha, page);
			if (data.items.length === 0) {
				console.log(`	No more items for alpha ${alpha} on page ${page}. Moving to next letter.`);
				break;
			}

			for (const item of data.items) {
				output[item.id] = ZCatalogueItemSchema.parse(
					omit(toSortedSnakeCaseObject(item), ['icon', 'icon_large', 'type', 'type_icon'] as any[])
				);
			}
			console.log(
				`	Processed page ${page} for alpha ${alpha}, total items so far: ${Object.keys(output).length}`
			);
			saveDataFile('os-catalogue.json', output);
			page++;
		}
	}
}

scrapeAll(1);
