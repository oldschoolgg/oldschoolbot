import { ButtonBuilder, ButtonStyle, dateFm } from '@oldschoolgg/discord';
import { formatDuration } from '@oldschoolgg/toolkit';

import { getGitSyncStatus, META_CONSTANTS } from '@/lib/constants.js';

function getInfoContent(details: boolean) {
	const uptime = formatDuration(Date.now() - META_CONSTANTS.STARTUP_DATE.getTime());
	const base = `**Uptime:** ${uptime}
**Bot Started:** ${dateFm(META_CONSTANTS.STARTUP_DATE)}
**Commit:** [${META_CONSTANTS.GIT_HASH.slice(0, 7)}](<${META_CONSTANTS.GITHUB_URL}>)
**Commit Message:** ${META_CONSTANTS.GIT_COMMIT_MESSAGE}`;

	if (!details) {
		return base;
	}

	const recentCommits =
		META_CONSTANTS.GIT_RECENT_COMMITS.length === 0
			? 'Unavailable'
			: META_CONSTANTS.GIT_RECENT_COMMITS.map((commit, index) => `${index + 1}. ${commit}`).join('\n');

	return `${base}
**Commit Date:** ${dateFm(META_CONSTANTS.GIT_COMMIT_DATE)}
**Code Difference:** <${META_CONSTANTS.GIT_DIFF_URL}>
**Status:** ${getGitSyncStatus()}
**Recent Commits:**
${recentCommits}`;
}

export function buildInfoResponse(details: boolean) {
	return {
		content: getInfoContent(details),
		components: [
			new ButtonBuilder().setLabel('View Commit').setStyle(ButtonStyle.Link).setURL(META_CONSTANTS.GITHUB_URL),
			new ButtonBuilder()
				.setLabel('Recent Commits')
				.setStyle(ButtonStyle.Link)
				.setURL(META_CONSTANTS.GITHUB_COMMITS_URL)
		]
	};
}

export const infoCommand = defineCommand({
	name: 'info',
	description: 'Shows bot information, including uptime and commit details.',
	options: [
		{
			type: 'Boolean',
			name: 'details',
			description: 'Show additional commit and deployment details.',
			required: false
		}
	],
	run: async ({ options }) => {
		return buildInfoResponse(options.details ?? false);
	}
});
