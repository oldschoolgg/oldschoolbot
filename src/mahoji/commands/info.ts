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

function getUptimeLine() {
	return `**Uptime:** ${formatDuration(Date.now() - META_CONSTANTS.STARTUP_DATE.getTime())}`;
}

function getRecentCommits(limit = 10) {
	if (META_CONSTANTS.GIT_RECENT_COMMITS.length === 0) return 'Unavailable';
	return META_CONSTANTS.GIT_RECENT_COMMITS.slice(0, limit)
		.map((commit, index) => {
			return `${index + 1}. ${formatRecentCommitLine(commit)}`;
		})
		.join('\n');
}

function getCommitContent(details: boolean) {
	const base = `**Commit Hash:** \`${META_CONSTANTS.GIT_HASH}\`
**Commit Message:** ${META_CONSTANTS.GIT_COMMIT_MESSAGE}`;
	if (!details) return base;
	return `${base}
**Commit Date:** ${dateFm(META_CONSTANTS.GIT_COMMIT_DATE)}
**Code Difference:** <${META_CONSTANTS.GIT_DIFF_URL}>
**Status:** ${getGitSyncStatus()}`;
}

function getRecentUpdatesContent() {
	return `**Recent Updates (Latest 10 Commits):**
${getRecentCommits(10)}`;
}

function getUptimeContent() {
	return `${getUptimeLine()}
**Bot Started:** ${dateFm(META_CONSTANTS.STARTUP_DATE)}`;
}

function getOverviewContent() {
	return `${getUptimeLine()}
**Commit:** [${META_CONSTANTS.GIT_HASH.slice(0, 7)}](<${META_CONSTANTS.GITHUB_URL}>) - ${META_CONSTANTS.GIT_COMMIT_MESSAGE}
**Recent Updates (Latest 3):**
${getRecentCommits(3)}`;
}

type InfoResponseType = 'commit' | 'recent_updates' | 'uptime' | 'overview';

function getInfoContent(type: InfoResponseType, details = false) {
	switch (type) {
		case 'commit':
			return getCommitContent(details);
		case 'recent_updates':
			return getRecentUpdatesContent();
		case 'uptime':
			return getUptimeContent();
		default:
			return getOverviewContent();
	}
}

export function buildInfoResponse(type: InfoResponseType, details = false) {
	return {
		content: getInfoContent(type, details),
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
	description: 'Shows bot information through subcommands.',
	options: [
		{
			type: 'Subcommand',
			name: 'commit',
			description: 'Show current commit hash and commit message.',
			options: [
				{
					type: 'Boolean',
					name: 'details',
					description: 'Show additional commit and deployment details.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'recent_updates',
			description: 'Show the latest commits and update titles.',
			options: []
		},
		{
			type: 'Subcommand',
			name: 'uptime',
			description: 'Show current bot uptime.',
			options: []
		},
		{
			type: 'Subcommand',
			name: 'overview',
			description: 'Show a quick overview with commit and uptime.',
			options: []
		}
	],
	run: async ({ options }) => {
		if (options.commit) return buildInfoResponse('commit', options.commit.details ?? false);
		if (options.recent_updates) return buildInfoResponse('recent_updates');
		if (options.uptime) return buildInfoResponse('uptime');
		return buildInfoResponse('overview');
	}
});
