import type { CommandRunOptions, ICommand, MahojiUserOption } from '@oldschoolgg/toolkit/discord-util';
import { ApplicationCommandOptionType } from 'discord.js';

import { globalConfig } from '../constants.js';
import { patreonTask } from '../lib/patreon.js';
import { detectMischief } from '../mischiefDetection.js';
import { Bits, CHANNELS, fetchUser, patronLogWebhook } from '../util.js';

export const toolsCommand: ICommand = {
	name: 'tools',
	description: 'RoboChimp tools.',
	guildID: globalConfig.supportServerID,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'setgithubid',
			description: 'Set someones github ID',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'github_username',
					description: 'The github username (leave blank to reset)',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'detect_mischief',
			description: 'Mischief!'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'patreon_sync',
			description: 'Patreon sync'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'debug_patreon',
			description: 'debug_patreon'
		}
	] as const,
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		setgithubid?: { user: MahojiUserOption; github_username?: string };
		cl_lb?: {};
		detect_mischief?: {};
		patreon_sync?: {};
		debug_patreon?: {};
	}>) => {
		await interaction.deferReply();
		const user = await fetchUser(userID);
		if (!user.bits.includes(Bits.Mod)) return 'Ook';

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
			const user = await fetchUser(BigInt(options.setgithubid.user.user.id));
			const { github_username } = options.setgithubid;

			if (!github_username) {
				await roboChimpClient.user.update({
					where: {
						id: user.id
					},
					data: {
						github_id: null
					}
				});
				return `Reset ${options.setgithubid.user.user.username}'s github ID.`;
			}
			const res = (await fetch(`https://api.github.com/users/${encodeURIComponent(github_username)}`)
				.then(res => res.json())
				.catch(() => null)) as Record<string, string> | null;
			if (!res || !res.id) {
				return 'Could not find user in github API. Is the username written properly?';
			}
			const num = Number.parseInt(res.id);
			if (!num || Number.isNaN(num)) {
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
			await roboChimpClient.user.update({
				where: {
					id: user.id
				},
				data: {
					github_id: num
				}
			});
			await patreonTask.syncGithub();
			const newUser = await fetchUser(user.id);
			return `Set ${options.setgithubid.user.user.username}'s github ID to ${newUser.github_id}, and synced their patron tier to: ${newUser.perk_tier}.`;
		}

		if (options.patreon_sync) {
			const res = await patreonTask.run();
			if (res) {
				patronLogWebhook.send(res.join('\n').slice(0, 1950));
			}
			return 'Done.';
		}

		if (!user.bits.includes(Bits.Admin)) return 'Ook';

		return 'Invalid command.';
	}
} as const;
