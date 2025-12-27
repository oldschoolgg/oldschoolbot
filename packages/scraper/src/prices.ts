import { pfetch } from '@oldschoolgg/toolkit/node';
import { objectToSnakeCase } from '@oldschoolgg/util';

import { saveDataFile } from './util.js';

type ItemPrice = {
	high: number;
	highTime: number;
	low: number;
	lowTime: number;
};

async function fetchPrices() {
	const allPrices = await pfetch('https://prices.runescape.wiki/api/v1/osrs/latest', {
		headers: {
			'User-Agent': 'oldschooljs - @magnaboy'
		},
		cacheForSeconds: 60 * 60 * 24
	})
		.then((res): Promise<any> => res.json())
		.then(res => res.data as Record<string, ItemPrice>);

	if (!allPrices[20_997]) {
		throw new Error('Failed to fetch prices');
	}

	saveDataFile('prices.json', objectToSnakeCase(allPrices));
}

fetchPrices();
