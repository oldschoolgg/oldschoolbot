import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Monsters } from 'oldschooljs';

import { autoslayChoices, slayerMasterChoices } from '../../lib/slayer/constants';
import { SlayerRewardsShop } from '../../lib/slayer/slayerUnlocks';
import {
	slayerListBlocksCommand,
	slayerNewTaskCommand,
	slayerSkipTaskCommand,
	slayerStatusCommand,
	slayerUnblockCommand
} from '../lib/abstracted_commands/slayerTaskCommand';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const slayerCommand: OSBMahojiCommand = {
	name: 'slayer',
	description: 'Slayer skill commands',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'autoslay',
			description: 'Send your minion to slay your current task.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'mode',
					description: 'Which autoslay mode do you want?',
					required: false,
					choices: autoslayChoices
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'save',
					description: 'Save your choice as default',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'task',
			description: 'Send your minion to slay your current task.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'master',
					description: 'Which Slayer master do you want a task from?',
					required: false,
					choices: slayerMasterChoices
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'save',
					description: 'Save your choice as default',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'manage',
			description: 'Manage your Slayer task/block list.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'skip',
					description: 'Skip your current task',
					required: false,
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'new',
							description: 'Get a new task automatically',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'block',
					description: 'Block your current task.',
					required: false,
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'new',
							description: 'Get a new task automatically',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'unblock',
					description: 'Unblock a task',
					required: false,
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'assignment',
							description: 'Assignment to unblock',
							required: true,
							autocomplete: async (value: string, user: APIUser) => {
								const blockList = await mahojiUsersSettingsFetch(user.id, { slayer_blocked_ids: true });
								if (blockList.slayer_blocked_ids.length === 0) {
									return [{ name: "You don't have any monsters blocked", value: '' }];
								}
								const blockedMonsters = blockList.slayer_blocked_ids.map(mId =>
									Monsters.find(m => m.id === mId)
								);
								return blockedMonsters
									.filter(m => (!value ? true : m!.name.toLowerCase().includes(value.toLowerCase())))
									.map(m => {
										return { name: m!.name, value: m!.name };
									});
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'list_blocks',
					description: 'List your blocked tasks.',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'rewards',
			description: 'Spend your Slayer rewards points.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'unlock',
					description: 'Unlock tasks, extensions, cosmetics, etc',
					required: false,
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'unlockable',
							description: 'Unlockable to purchase',
							required: true,
							autocomplete: async (value: string) => {
								return SlayerRewardsShop.filter(
									r =>
										!r.item &&
										(!value
											? true
											: r.name.toLowerCase().includes(value) ||
											  r.aliases?.some(alias =>
													alias.toLowerCase().includes(value.toLowerCase())
											  ))
								).map(m => {
									return { name: m.name, value: m.name };
								});
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'buy',
					description: 'Purchase something with points',
					required: false,
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'item',
							description: 'Item to purchase',
							required: true,
							autocomplete: async (value: string) => {
								return SlayerRewardsShop.filter(
									r =>
										r.item &&
										(!value
											? true
											: r.name.toLowerCase().includes(value) ||
											  r.aliases?.some(alias =>
													alias.toLowerCase().includes(value.toLowerCase())
											  ))
								).map(m => {
									return { name: m.name, value: m.name };
								});
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'show_unlocks',
					description: 'Show purchased unlocks',
					required: false
				}
			]
		}
	],
	run: async ({
		user,
		options,
		channelID,
		userID,
		interaction
	}: CommandRunOptions<{
		autoslay?: { mode?: string; save?: boolean };
		task?: { master?: string; save?: boolean };
		manage?: {
			skip?: { new?: boolean };
			block?: { new?: boolean };
			unblock?: { assignment: string };
			list_blocks?: {};
		};
		rewards?: { unlock?: { unlockable: string }; buy?: { item: string }; show_unlocks?: {} };
		status?: {};
	}>) => {
		const klasaUser = globalClient.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);

		if (options.autoslay) {
		}
		if (options.task) {
			return await slayerNewTaskCommand(
				mahojiUser,
				interaction,
				'',
				options.task.master,
				Boolean(options.task.save)
			);
		}
		if (options.manage) {
			if (options.manage.list_blocks) {
				return slayerListBlocksCommand(mahojiUser);
			}
			if (options.manage.unblock) {
				return await slayerUnblockCommand(mahojiUser, options.manage.unblock.assignment);
			}
			if (options.manage.skip || options.manage.block) {
				return await slayerSkipTaskCommand(
					mahojiUser,
					Boolean(options.manage.block),
					Boolean(options.manage.skip?.new ?? options.manage.block?.new),
					interaction
				);
			}
		}
		if (options.status) {
			return slayerStatusCommand(mahojiUser);
		}
		console.log(options);
		console.log(`channel: ${channelID} - user: ${userID}`);
		return `${user.username} - ${JSON.stringify(options)}`;
	}
};
