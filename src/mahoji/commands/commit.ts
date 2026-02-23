import { ButtonBuilder, ButtonStyle, dateFm } from '@oldschoolgg/discord';

import { getGitSyncStatus, META_CONSTANTS } from '@/lib/constants.js';

export const commitCommand = defineCommand({
	name: 'commit',
	description: 'Shows the currently running bot commit.',
	options: [
		{
			type: 'Boolean',
			name: 'details',
			description: 'Show additional commit and deployment details.',
			required: false
		}
	],
	run: async ({ options }) => {
		const base = `**Commit Date:** ${dateFm(META_CONSTANTS.GIT_COMMIT_DATE)}
**Code Difference:** <${META_CONSTANTS.GIT_DIFF_URL}>`;

		const components = [
			new ButtonBuilder().setLabel('View Commit').setStyle(ButtonStyle.Link).setURL(META_CONSTANTS.GITHUB_URL),
			new ButtonBuilder()
				.setLabel('Recent Commits')
				.setStyle(ButtonStyle.Link)
				.setURL(META_CONSTANTS.GITHUB_COMMITS_URL)
		];

		if (!options.details) {
			return {
				content: base,
				components
			};
		}

		return {
			content: `${base}
**Git Hash:** ${META_CONSTANTS.GIT_HASH.slice(0, 7)}
**Full Hash:** \`${META_CONSTANTS.GIT_HASH}\`
**Status:** ${getGitSyncStatus()}
**Bot Started:** ${dateFm(META_CONSTANTS.STARTUP_DATE)}`,
			components
		};
	}
});
