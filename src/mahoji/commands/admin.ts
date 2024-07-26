import { type CommandRunOptions, bulkUpdateCommands, dateFm } from '@oldschoolgg/toolkit';
import type { MahojiUserOption } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, noOp, randArrItem, sleep } from 'e';

import { DISABLED_COMMANDS, META_CONSTANTS, globalConfig } from '../../lib/constants';
import { cancelTask, minionActivityCacheDelete } from '../../lib/settings/settings';
import { stringMatches } from '../../lib/util';
import { deferInteraction, interactionReply } from '../../lib/util/interactionReply';
import { sendToChannelID } from '../../lib/util/webhook';
import { Cooldowns } from '../lib/Cooldowns';
import type { OSBMahojiCommand } from '../lib/util';
import { allAbstractCommands } from '../lib/util';

export const gifs = [
	'https://tenor.com/view/angry-stab-monkey-knife-roof-gif-13841993',
	'https://gfycat.com/serenegleamingfruitbat',
	'https://tenor.com/view/monkey-monito-mask-gif-23036908'
];

export const adminCommand: OSBMahojiCommand = {
	name: 'admin',
	description: 'Allows you to trade items with other players.',
	guildID: globalConfig.mainServerID,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'shut_down',
			description: 'Shut down the bot without rebooting.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'reboot',
			description: 'Reboot the bot.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sync_commands',
			description: 'Sync commands',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cancel_task',
			description: 'Cancel a users task',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'command',
			description: 'Enable/disable commands',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'disable',
					description: 'The command to disable',
					required: false,
					autocomplete: async (value: string) => {
						const disabledCommands = Array.from(DISABLED_COMMANDS.values());
						return allAbstractCommands(globalClient.mahojiClient)
							.filter(i => !disabledCommands.includes(i.name))
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'enable',
					description: 'The command to enable',
					required: false,
					autocomplete: async () => {
						const disabledCommands = Array.from(DISABLED_COMMANDS.values());
						return allAbstractCommands(globalClient.mahojiClient)
							.filter(i => disabledCommands.includes(i.name))
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'double_loot',
			description: 'Manage double loot',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'reset',
					description: 'Reset double loot',
					required: false
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'add',
					description: 'Add double loot time',
					required: false
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		reboot?: {};
		shut_down?: {};
		sync_commands?: {};
		cancel_task?: { user: MahojiUserOption };
		command?: { enable?: string; disable?: string };
		double_loot?: { reset?: boolean; add?: string };
	}>) => {
		await deferInteraction(interaction);
		const mods = [
			'794368001856110594',
			'604278562320810009',
			'425134194436341760',
			'157797566833098752',
			'507686806624534529'
		];
		if (!mods.includes(userID)) return randArrItem(gifs);

		if (options.cancel_task) {
			const { user } = options.cancel_task.user;
			await cancelTask(user.id);
			globalClient.busyCounterCache.delete(user.id);
			Cooldowns.delete(user.id);
			minionActivityCacheDelete(user.id);
			return 'Done.';
		}

		if (options.command) {
			const { disable } = options.command;
			const { enable } = options.command;

			const currentDisabledCommands = (await prisma.clientStorage.findFirst({
				where: { id: globalConfig.clientID },
				select: { disabled_commands: true }
			}))!.disabled_commands;

			const command = allAbstractCommands(globalClient.mahojiClient).find(c =>
				stringMatches(c.name, disable ?? enable ?? '-')
			);
			if (!command) return "That's not a valid command.";

			if (disable) {
				if (currentDisabledCommands.includes(command.name)) {
					return 'That command is already disabled.';
				}
				const newDisabled = [...currentDisabledCommands, command.name.toLowerCase()];
				await prisma.clientStorage.update({
					where: {
						id: globalConfig.clientID
					},
					data: {
						disabled_commands: newDisabled
					}
				});
				DISABLED_COMMANDS.add(command.name);
				return `Disabled \`${command.name}\`.`;
			}
			if (enable) {
				if (!currentDisabledCommands.includes(command.name)) {
					return 'That command is not disabled.';
				}
				await prisma.clientStorage.update({
					where: {
						id: globalConfig.clientID
					},
					data: {
						disabled_commands: currentDisabledCommands.filter(i => i !== command.name)
					}
				});
				DISABLED_COMMANDS.delete(command.name);
				return `Enabled \`${command.name}\`.`;
			}
			return 'Invalid.';
		}

		if (options.reboot) {
			globalClient.isShuttingDown = true;
			await interactionReply(interaction, {
				content: 'https://media.discordapp.net/attachments/357422607982919680/1004657720722464880/freeze.gif'
			});
			await sleep(Time.Second * 20);
			await sendToChannelID(globalConfig.generalChannelID, {
				content: `I am shutting down! Goodbye :(

${META_CONSTANTS.RENDERED_STR}`
			}).catch(noOp);
			process.exit();
		}
		if (options.shut_down) {
			debugLog('SHUTTING DOWN');
			globalClient.isShuttingDown = true;
			const timer = Time.Second * 30;
			await interactionReply(interaction, {
				content: `Shutting down in ${dateFm(new Date(Date.now() + timer))}.`
			});
			await sleep(timer);
			await sendToChannelID(globalConfig.generalChannelID, {
				content: `I am shutting down! Goodbye :(

${META_CONSTANTS.RENDERED_STR}`
			}).catch(noOp);
			process.exit(0);
		}

		if (options.sync_commands) {
			const global = Boolean(globalConfig.isProduction);
			const totalCommands = Array.from(globalClient.mahojiClient.commands.values());
			const globalCommands = totalCommands.filter(i => !i.guildID);
			const guildCommands = totalCommands.filter(i => Boolean(i.guildID));

			await bulkUpdateCommands({
				client: globalClient.mahojiClient,
				commands: globalCommands,
				guildID: null
			});

			return `Synced commands ${global ? 'globally' : 'locally'}.
${totalCommands.length} Total commands
${globalCommands.length} Global commands
${guildCommands.length} Guild commands`;
		}

		return 'Invalid command.';
	}
};
