import { EmbedBuilder } from '@oldschoolgg/discord';

import { getWikiAutocompleteResults } from '@/mahoji/lib/wikiAutocomplete.js';

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
				return getWikiAutocompleteResults(value ?? '', globalClient.application?.owner?.id || 'unknown');
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
