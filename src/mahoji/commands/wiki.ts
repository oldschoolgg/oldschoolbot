import { EmbedBuilder } from '@oldschoolgg/discord';
import { fetch } from 'undici';

type WikiPage = {
	pageid: number;
	ns: number;
	title: string;
	index: number;
	extract?: string;
	thumbnail?: { source: string; width: number; height: number };
};

type WikiResponse = {
	query?: { pages?: Record<string, WikiPage> };
	error?: { code: string; info: string };
};

type WikiOpenSearchResponse = [string, string[], string[], string[]];

const wikiAutoCache = new Map<string, { ts: number; titles: string[] }>();
const wikiAutoInflight = new Map<string, Promise<string[]>>();

const WIKI_AUTOCACHE_TTL = 60_000; // 60s
const AUTOCOMPLETE_TIMEOUT_MS = 900; // keep under ~1s

function toWikiUrl(title: string) {
	return `https://oldschool.runescape.wiki/w/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

function buildEmbed(page: { title: string; url: string; extract?: string; thumbnail?: string }) {
	const extract = page.extract?.trim();
	const desc = extract && extract.length > 4096 ? `${extract.slice(0, 4093)}...` : extract;

	const embed = new EmbedBuilder()
		.setTitle(page.title)
		.setURL(page.url)
		.setDescription(desc || 'No summary available, but you can view the page above.');

	if (page.thumbnail) embed.setThumbnail(page.thumbnail);
	return embed;
}

export const wikiCommand = defineCommand({
	name: 'wiki',
	description: 'Search the official OSRS wiki.',
	options: [
		{
			type: 'String',
			name: 'query',
			description: 'Your search query.',
			required: true,
			autocomplete: async ({ value }: StringAutoComplete) => {
				const q = value?.trim();
				if (!q || q.length < 2) return [];

				const key = q.toLowerCase();
				const now = Date.now();

				const cached = wikiAutoCache.get(key);
				if (cached && now - cached.ts < WIKI_AUTOCACHE_TTL) {
					return cached.titles.slice(0, 25).map((t: string) => ({ name: t, value: t }));
				}

				let p = wikiAutoInflight.get(key);
				if (!p) {
					p = (async () => {
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
									'User-Agent': `OldSchoolBot (discord; owner=${globalClient.application?.owner?.id || 'unknown'})`,
									Accept: 'application/json'
								},
								signal: AbortSignal.timeout(AUTOCOMPLETE_TIMEOUT_MS)
							});

							if (!res.ok) return [];

							const data = (await res.json()) as WikiOpenSearchResponse;
							const titles: string[] = data?.[1] ?? [];

							wikiAutoCache.set(key, { ts: Date.now(), titles });
							return titles;
						} catch {
							return [];
						} finally {
							wikiAutoInflight.delete(key);
						}
					})();

					wikiAutoInflight.set(key, p);
				}

				const titles = await p;
				const fallback = titles.length ? titles : (wikiAutoCache.get(key)?.titles ?? []);
				return fallback.slice(0, 25).map((t: string) => ({ name: t, value: t }));
			}
		}
	],
	run: async ({ options }) => {
		const params = new URLSearchParams({
			action: 'query',
			format: 'json',
			generator: 'search',
			gsrnamespace: '0',
			gsrsearch: options.query,
			gsrlimit: '1',
			gsrsort: 'relevance',
			gsrprofile: 'popular_inclinks_pv',
			prop: 'pageimages|extracts',
			pilimit: 'max',
			exintro: '',
			explaintext: '',
			exsentences: '1',
			exlimit: 'max',
			utf8: ''
		});

		const url = `https://oldschool.runescape.wiki/api.php?${params.toString()}`;

		try {
			const res = await fetch(url, {
				headers: {
					'User-Agent': `OldSchoolBot (discord; owner=${globalClient.application?.owner?.id || 'unknown'})`,
					Accept: 'application/json'
				},
				signal: AbortSignal.timeout(4000)
			});

			if (!res.ok) throw new Error(`Wiki HTTP ${res.status}`);

			const data = (await res.json()) as WikiResponse;
			if (data.error) return 'OSRS Wiki returned an error for that query.';

			const pagesObj = data.query?.pages;
			const pagesRaw = pagesObj ? Object.values(pagesObj) : [];
			const page = pagesRaw.sort((a, b) => a.index - b.index)[0];

			if (!page) return 'No results found.';

			return {
				embeds: [
					buildEmbed({
						title: page.title,
						url: toWikiUrl(page.title),
						extract: page.extract,
						thumbnail: page.thumbnail?.source
					})
				]
			};
		} catch (err) {
			if (err instanceof Error) {
				Logging.logError(err, { query: options.query, type: 'wiki_command' });
			}
			return `There was an error getting results from the OSRS Wiki. You can try searching directly: https://oldschool.runescape.wiki/?search=${encodeURIComponent(
				options.query
			)}`;
		}
	}
});
