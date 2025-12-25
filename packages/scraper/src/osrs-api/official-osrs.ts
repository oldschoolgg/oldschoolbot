import currentData from '../data/os-catalogue.json' with {type: 'json'};
import { omit } from 'remeda';
import { toSortedSnakeCaseObject } from "@oldschoolgg/util";
import { saveDataFile } from "../util.js";

type OSRSApiPrice = string | number;

type CatalogueItem = {
	id: number
	name: string
	description: string
	current: {
		trend: string
		price: OSRSApiPrice
	}
	today: {
		trend: string
		price: OSRSApiPrice
	}
	members: 'true' | 'false'
};

export type CatalogueItemsResponse = {
	total: number
	items: CatalogueItem[];
}

const BASE_URL = "https://secure.runescape.com/m=itemdb_oldschool/api/catalogue/items.json";
// const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const ALPHABET = 'mnopqrstuvwxyz'.split('');

async function fetchPage(category: number, alpha: string, page: number): Promise<CatalogueItemsResponse> {
	const url = `${BASE_URL}?category=${category}&alpha=${alpha}&page=${page}`;
	console.log(`Fetching: ${url}`);

	const MAX_RETRIES = 3;
	const WAIT_TIME_MS = 2500;
	let lastError: any;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			const text = await fetch(url).then(res => res.text());
			const res = JSON.parse(text);
			return res as CatalogueItemsResponse;
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

const output: Record<string, CatalogueItem> = {};

for (const x of Object.values(currentData.data)) {
	output[x.id] = x as CatalogueItem;
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
				output[item.id] = omit(toSortedSnakeCaseObject(item), ['icon', 'icon_large', 'type', 'type_icon'] as any[]) as CatalogueItem;
			}
			console.log(`	Processed page ${page} for alpha ${alpha}, total items so far: ${Object.keys(output).length}`);
			saveDataFile('os-catalogue.json', output);
			page++;
		}
	}
}

scrapeAll(1);
