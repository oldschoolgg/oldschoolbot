export const tosPrivacyCommand = defineCommand({
	name: 'tos',
	description: 'View the OSB Reactions privacy policy.',
	options: [
		{
			type: 'Subcommand',
			name: 'privacy',
			description: 'View the OSB Reactions privacy policy.',
			options: []
		}
	],
	run: async ({ options }) => {
		if (!options.privacy) return 'Unknown tos option.';
		return {
			content:
				'OSB Reactions stores no additional information. We use message content only to identify who people are talking to, replying to, or mentioning, then react according to existing user config plus unlock status/settings in our server and game. We do not store message content, who a message was to, metadata, or any other OSB Reactions-specific data, and this bot has no tables or data files that collect that information.',
			ephemeral: true
		};
	}
});
