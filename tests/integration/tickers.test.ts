import { describe, test } from 'vitest';

import { tickers } from '../../src/lib/tickers.js';
import { mockClient } from './util.js';

describe('Tickers', async () => {
	await mockClient();

	test('Tickers', async () => {
		for (const ticker of tickers) {
			await ticker.cb();
		}
	});
});
