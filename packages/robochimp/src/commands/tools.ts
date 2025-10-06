import { globalConfig } from '../constants.js';
import { patreonTask } from '../lib/patreon.js';
import { detectMischief } from '../mischiefDetection.js';
import { CHANNELS, patronLogWebhook } from '../util.js';

export const toolsCommand: RoboChimpCommand = {
	name: 'tools',
	description: 'RoboChimp tools.',
	options: [
		{
			type: 'Subcommand',
			name: 'setgithubid',
			description: 'Set someones github ID',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user',
					required: true
				},
				{
					type: 'String',
					name: 'github_username',
					description: 'The github username (leave blank to reset)',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'detect_mischief',
			description: 'Mischief!'
		},
		{
			type: 'Subcommand',
			name: 'patreon_sync',
			description: 'Patreon sync'
		},
		{
			type: 'Subcommand',
			name: 'debug_patreon',
			description: 'debug_patreon'
		}
	] as const,
	run: async ({
		options,
		user,
		interaction,
		client
	}: CommandRunOptions<{
		setgithubid?: { user: MahojiUserOption; github_username?: string };
		detect_mischief?: {};
		patreon_sync?: {};
		debug_patreon?: {};
	}>) => {
		await interaction.defer();
		if (!user.isMod()) return 'Ook';

		if (options.debug_patreon) {
			const res = await patreonTask.fetchPatrons();
			return {
				content: 'Debug',
				files: [{ attachment: Buffer.from(JSON.stringify(res)), name: 'data.json' }]
			};
		}

		if (options.detect_mischief) {
			if (
				globalConfig.isProduction &&
				![CHANNELS.MODERATORS, CHANNELS.MODERATORS_OTHER].includes(interaction.channelId)
			) {
				return "You can't run this command in this channel.";
			}
			const [osbResult, bsoResult] = await Promise.all([detectMischief('osb'), detectMischief('bso')]);
			return {
				content: "Here's the mischief reports!",
				files: [
					{ attachment: Buffer.from(osbResult), name: 'osb.txt' },
					{ attachment: Buffer.from(bsoResult), name: 'bso.txt' }
				]
			};
		}

		if (options.setgithubid) {
			const githubSetUser = await client.fetchUser(options.setgithubid.user.user.id);
			const { github_username } = options.setgithubid;

			if (!github_username) {
				await githubSetUser.update({ github_id: null });
				return `Reset ${options.setgithubid.user.user.username}'s github ID.`;
			}
			const res = (await fetch(`https://api.github.com/users/${encodeURIComponent(github_username)}`)
				.then(res => res.json())
				.catch(() => null)) as Record<string, string> | null;
			if (!res || !res.id) {
				return 'Could not find user in github API. Is the username written properly?';
			}
			const num = Number.parseInt(res.id);
			if (!num) {
				return 'Invalid id';
			}
			const alreadyHasName = await roboChimpClient.user.count({
				where: {
					github_id: num
				}
			});
			if (alreadyHasName > 0) {
				return `Someone (${alreadyHasName}) already has this Github account connected.`;
			}

			await githubSetUser.update({
				github_id: num
			});
			await patreonTask.syncGithub();
			return `Set ${options.setgithubid.user.user.username}'s github ID to ${githubSetUser.githubId}, and synced their patron tier to: ${githubSetUser.perkTier}.`;
		}

		if (options.patreon_sync) {
			const res = await patreonTask.run();
			if (res) {
				patronLogWebhook.send(res.join('\n').slice(0, 1950));
			}
			return 'Done.';
		}

		return 'Invalid command.';
	}
} as const;
