import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WIKI_AUTOCOMPLETE_CACHE } from '../../src/lib/cache.js';
import { getWikiAutocompleteResults } from '../../src/mahoji/lib/wikiAutocomplete.js';

describe('Wiki autocomplete', () => {
	beforeEach(() => {
		WIKI_AUTOCOMPLETE_CACHE.clear();
		vi.restoreAllMocks();
	});

	it('returns cached results without fetching', async () => {
		WIKI_AUTOCOMPLETE_CACHE.set('zulrah', ['Zulrah', 'Zulrah scales']);
		const fetchSpy = vi.spyOn(globalThis, 'fetch');

		const result = await getWikiAutocompleteResults('Zulrah');

		expect(fetchSpy).not.toHaveBeenCalled();
		expect(result).toEqual([
			{ name: 'Zulrah', value: 'Zulrah' },
			{ name: 'Zulrah scales', value: 'Zulrah scales' }
		]);
	});

	it('returns empty array when fetch fails and there is no cache', async () => {
		vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));

		const result = await getWikiAutocompleteResults('vorkath');

		expect(result).toEqual([]);
	});

	it('fetches and caches autocomplete titles on success', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify(['', ['Vorkath', 'Vorkath head'], [], []]), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const result = await getWikiAutocompleteResults('vorkath');

		expect(result).toEqual([
			{ name: 'Vorkath', value: 'Vorkath' },
			{ name: 'Vorkath head', value: 'Vorkath head' }
		]);
		expect(WIKI_AUTOCOMPLETE_CACHE.get('vorkath')).toEqual(['Vorkath', 'Vorkath head']);
	});
});
