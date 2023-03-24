import { describe, test } from 'vitest';

import { tickers } from '../../src/lib/tickers';
import { mockClient } from './util';

describe('Tickers', async () => {
	await mockClient();

	test('Tickers', async () => {
		for (const ticker of tickers) {
			await ticker.cb();
		}
	});
});
