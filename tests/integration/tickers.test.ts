import { describe, test } from 'vitest';

import { tickers } from '../../src/lib/tickers.js';
import { mockClient } from './util.js';

const ignored = ['Analytics'];

describe('Tickers', async () => {
	await mockClient();

	test('Tickers', async () => {
		for (const ticker of tickers) {
			if (ignored.includes(ticker.name)) continue;
			await ticker.cb();
		}
	});
});
