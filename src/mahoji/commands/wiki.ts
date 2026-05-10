import { EmbedBuilder } from '@oldschoolgg/discord';

type WikiResponse = {
	batchcomplete?: string;
	continue?: {
		gsroffset?: number;
		continue?: string;
	};
	query: {
		pages: Record<
			string,
			{
				pageid: number;
				ns: number;
				title: string;
				index: number;
				extract: string;
				thumbnail?: {
					source: string;
					width: number;
					height: number;
				};
			}
		>;
	};
	limits?: {
		pageimages?: number;
		extracts?: number;
	};
};

export const wikiCommand = defineCommand({
	name: 'wiki',
	description: 'Search the official OSRS wiki.',
	options: [
		{
			type: 'String',
			name: 'query',
			description: 'Your search query.',
			required: true
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

		const result: WikiResponse = (await fetch(url, {
			headers: {
				'User-Agent': `application=OldSchoolBot,discord_user_id=${globalClient.application?.owner?.id || 'unknown'}`,
				Accept: 'application/json'
			}
		}).then(res => res.json())) as WikiResponse;
		const pageInfo = result.query?.pages ? Object.values(result.query.pages)[0] : null;

		if (!pageInfo) {
			return 'No results found.';
		}
		const embed = new EmbedBuilder()
			.setTitle(pageInfo.title)
			.setURL(`https://oldschool.runescape.wiki/w/${encodeURIComponent(pageInfo.title.replace(/ /g, '_'))}`)
			.setDescription(
				pageInfo.extract.length > 2048 ? `${pageInfo.extract.slice(0, 2045)}...` : pageInfo.extract
			);
		if (pageInfo.thumbnail) {
			embed.setThumbnail(pageInfo.thumbnail.source);
		}
		return {
			embeds: [embed]
		};
	}
});
