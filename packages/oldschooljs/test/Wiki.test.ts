import { describe, expect, test } from 'vitest';

import { Wiki } from '../src';

describe('Wiki', () => {
	test('Searching', async () => {
		expect.assertions(2);

		const searchResults = await Wiki.search('tbow');
		const twistedBow = searchResults[0];
		expect(twistedBow.title).toEqual('Twisted bow');
		expect(searchResults.length).toBeGreaterThanOrEqual(4);
	});

	test('Random', async () => {
		expect.assertions(2);

		const fiveRandom = await Wiki.random(5);
		const twentyRandom = await Wiki.random(20);

		expect(fiveRandom.length).toEqual(5);
		expect(twentyRandom.length).toEqual(20);
	});

	test('Fetching by ID', async () => {
		expect.assertions(1);

		const twistedBowPage = await Wiki.fetchPage(82_098);
		if (!twistedBowPage) throw new Error('Failed to fetch page');
		expect(twistedBowPage.title).toEqual('Twisted bow');
	});
});
