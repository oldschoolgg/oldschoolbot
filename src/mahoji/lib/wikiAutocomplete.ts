import { WIKI_AUTOCOMPLETE_CACHE } from '@/lib/cache.js';

type WikiOpenSearchResponse = [string, string[], string[], string[]];

const AUTOCOMPLETE_TIMEOUT_MS = 900; // keep under ~1s

type WikiAutocompleteChoice = {
	name: string;
	value: string;
};

export async function getWikiAutocompleteResults(
	query: string,
	ownerID = 'unknown'
): Promise<WikiAutocompleteChoice[]> {
	const q = query.trim();
	if (q.length < 2) return [];

	const key = q.toLowerCase();
	const cached = WIKI_AUTOCOMPLETE_CACHE.get(key);
	if (cached) {
		return cached.slice(0, 25).map(t => ({ name: t, value: t }));
	}

	let titles: string[] = [];
	try {
		const params = new URLSearchParams({
			action: 'opensearch',
			search: q,
			limit: '25',
			namespace: '0',
			format: 'json'
		});

		const url = `https://oldschool.runescape.wiki/api.php?${params.toString()}`;

		const res = await fetch(url, {
			headers: {
				'User-Agent': `OldSchoolBot (discord; owner=${ownerID})`,
				Accept: 'application/json'
			},
			signal: AbortSignal.timeout(AUTOCOMPLETE_TIMEOUT_MS)
		});

		if (res.ok) {
			const data = (await res.json()) as WikiOpenSearchResponse;
			titles = data?.[1] ?? [];
			WIKI_AUTOCOMPLETE_CACHE.set(key, titles);
		}
	} catch {
		titles = [];
	}

	const fallback = titles.length ? titles : (WIKI_AUTOCOMPLETE_CACHE.get(key) ?? []);
	return fallback.slice(0, 25).map(t => ({ name: t, value: t }));
}
