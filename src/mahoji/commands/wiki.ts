export const wikiCommand = defineCommand({
	name: 'wiki',
	description: 'Search the official OSRS wiki.',
	options: [
		{
			type: 'String',
			name: 'query',
			description: 'Your search query.',
			required: true,
			autocomplete: async (value: string) => {
				if (!value) return [];
				try {
					const autocompleteResult: any = await fetch(
						`https://oldschool.runescape.wiki/api.php?action=opensearch&format=json&formatversion=2&search=${encodeURIComponent(
							value
						)}&namespace=0&limit=10`
					).then(res => res.json());
					const results: string[] = autocompleteResult[1] ?? [];
					return results.map(i => ({ name: i.slice(0, 32), value: i.slice(0, 32) }));
				} catch (_) {
					return [];
				}
			}
		}
	],
	run: async ({ options }) => {
		return `https://oldschool.runescape.wiki/${encodeURIComponent(options.query)}`;
	}
});
