import { ButtonBuilder, ButtonStyle, EmbedBuilder } from '@oldschoolgg/discord';
import { nanoid } from 'nanoid';
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

type CachedWiki = {
	createdAt: number;
	userID: string;
	pages: Array<{ title: string; url: string; extract?: string; thumbnail?: string }>;
};

type WikiOpenSearchResponse = [string, string[], string[], string[]];

const wikiButtonCache = new Map<string, CachedWiki>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cleanupOldCacheEntries() {
	const now = Date.now();
	for (const [k, v] of wikiButtonCache.entries()) {
		if (now - v.createdAt > CACHE_TTL_MS) wikiButtonCache.delete(k);
	}
}

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
				if (!value || value.trim().length < 2) return [];

				const params = new URLSearchParams({
					action: 'opensearch',
					search: value.trim(),
					limit: '25',
					namespace: '0',
					format: 'json'
				});

				const url = `https://oldschool.runescape.wiki/api.php?${params.toString()}`;

				try {
					const res = await fetch(url, {
						headers: {
							'User-Agent': `OldSchoolBot (discord; owner=${globalClient.application?.owner?.id || 'unknown'})`,
							Accept: 'application/json'
						},
						signal: AbortSignal.timeout(2500)
					});

					if (!res.ok) return [];

					const data = (await res.json()) as WikiOpenSearchResponse;
					const titles = data?.[1] ?? [];

					return titles.slice(0, 25).map(t => ({
						name: t,
						value: t
					}));
				} catch {
					return [];
				}
			}
		}
	],
	run: async ({ options, interaction }) => {
		cleanupOldCacheEntries();

		const params = new URLSearchParams({
			action: 'query',
			format: 'json',
			generator: 'search',
			gsrnamespace: '0',
			gsrsearch: options.query,
			gsrlimit: '3',
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
				signal: AbortSignal.timeout(8000)
			});

			if (!res.ok) throw new Error(`Wiki HTTP ${res.status}`);

			const data = (await res.json()) as WikiResponse;
			if (data.error) return 'OSRS Wiki returned an error for that query.';

			const pagesObj = data.query?.pages;
			const pagesRaw = pagesObj ? Object.values(pagesObj) : [];

			const topPages = pagesRaw
				.sort((a, b) => a.index - b.index)
				.slice(0, 3)
				.map(p => ({
					title: p.title,
					url: toWikiUrl(p.title),
					extract: p.extract,
					thumbnail: p.thumbnail?.source
				}));

			if (topPages.length === 0) return 'No results found.';

			const userID = interaction.userId;
			const token = nanoid(10);
			const cacheKey = `wiki:${userID}:${token}`;

			wikiButtonCache.set(cacheKey, { createdAt: Date.now(), userID, pages: topPages });

			const navButtons = topPages.map((_, i) =>
				new ButtonBuilder()
					.setLabel(String(i + 1))
					.setStyle(ButtonStyle.Primary)
					.setCustomId(`${cacheKey}:${i}`)
			);

			const linkButton = new ButtonBuilder()
				.setLabel('Open on Wiki')
				.setStyle(ButtonStyle.Link)
				.setURL(topPages[0].url);

			return {
				embeds: [buildEmbed(topPages[0])],
				components: [...navButtons, linkButton]
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

export { wikiButtonCache, buildEmbed };

export async function handleWikiButtonInteraction(interaction: MInteraction, id: string): Promise<boolean> {
	if (!id.startsWith('wiki:')) return false;

	const parts = id.split(':');
	if (parts.length < 4) return false;

	const ownerUserID = parts[1];
	const token = parts[2];
	const index = Number(parts[3]);

	const cacheKey = `wiki:${ownerUserID}:${token}`;
	const entry = wikiButtonCache.get(cacheKey);

	if (!entry) {
		await interaction.reply({ content: 'That wiki menu expired. Run /wiki again.', ephemeral: true });
		return true;
	}

	if (interaction.userId !== entry.userID) {
		await interaction.reply({ content: 'That menu isn’t for you.', ephemeral: true });
		return true;
	}

	const page = entry.pages[index];
	if (!page) {
		await interaction.reply({ content: 'Invalid selection.', ephemeral: true });
		return true;
	}

	const navButtons = entry.pages.map((_, i) =>
		new ButtonBuilder()
			.setLabel(String(i + 1))
			.setStyle(ButtonStyle.Primary)
			.setCustomId(`${cacheKey}:${i}`)
	);

	const linkButton = new ButtonBuilder().setLabel('Open on Wiki').setStyle(ButtonStyle.Link).setURL(page.url);

	await interaction.update({
		embeds: [buildEmbed(page)],
		components: [...navButtons, linkButton]
	});

	return true;
}
