import { ButtonBuilder, ButtonStyle, dateFm } from '@oldschoolgg/discord';
import { formatDuration } from '@oldschoolgg/toolkit';

import { getGitSyncStatus, META_CONSTANTS } from '@/lib/constants.js';

function formatRecentCommitLine(line: string): string {
	const match = line.match(/^([0-9a-fA-F]+)\s+(.+)$/);
	if (!match) return line;
	const [, shortHash, subject] = match;
	const commitUrlPrefix = META_CONSTANTS.GITHUB_URL.split('/commit/')[0];
	return `[${shortHash}](<${commitUrlPrefix}/commit/${shortHash}>) ${subject}`;
}

function getInfoContent(details: boolean) {
	const uptime = formatDuration(Date.now() - META_CONSTANTS.STARTUP_DATE.getTime());
	const recentCommits =
		META_CONSTANTS.GIT_RECENT_COMMITS.length === 0
			? 'Unavailable'
			: META_CONSTANTS.GIT_RECENT_COMMITS.map(
					(commit, index) => `${index + 1}. ${formatRecentCommitLine(commit)}`
				).join('\n');

	const base = `**Uptime:** ${uptime}
**Bot Started:** ${dateFm(META_CONSTANTS.STARTUP_DATE)}
**Commit Message:** ${META_CONSTANTS.GIT_COMMIT_MESSAGE}
**Recent Commits:**
${recentCommits}`;

	if (!details) {
		return base;
	}

	return `${base}
**Commit Date:** ${dateFm(META_CONSTANTS.GIT_COMMIT_DATE)}
**Commit:** [${META_CONSTANTS.GIT_HASH.slice(0, 7)}](<${META_CONSTANTS.GITHUB_URL}>)
**Code Difference:** <${META_CONSTANTS.GIT_DIFF_URL}>
**Status:** ${getGitSyncStatus()}`;
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
