import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import type { User } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Monsters } from 'oldschooljs';

import { autoslayChoices, slayerMasterChoices } from '../../lib/slayer/constants';
import { SlayerRewardsShop } from '../../lib/slayer/slayerUnlocks';
import { deferInteraction } from '../../lib/util/interactionReply';
import { autoSlayCommand } from '../lib/abstracted_commands/autoSlayCommand';
import {
	slayerShopBuyCommand,
	slayerShopListMyUnlocks,
	slayerShopListRewards
} from '../lib/abstracted_commands/slayerShopCommand';
import {
	slayerListBlocksCommand,
	slayerNewTaskCommand,
	slayerSkipTaskCommand,
	slayerStatusCommand,
	slayerUnblockCommand
} from '../lib/abstracted_commands/slayerTaskCommand';
import type { OSBMahojiCommand } from '../lib/util';
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
			name: 'new_task',
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
			type: ApplicationCommandOptionType.Subcommand,
			name: 'manage',
			description: 'Manage your current Slayer task.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'command',
					description: 'Skip your current task',
					required: true,
					choices: ['skip', 'block', 'list_blocks'].map(c => {
						return { name: c, value: c };
					})
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'new',
					description: 'Get a new task (if applicable)',
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
							autocomplete: async (value: string, user: User) => {
								const { slayer_unlocks: myUnlocks } = await mahojiUsersSettingsFetch(user.id, {
									slayer_unlocks: true
								});
								const slayerUnlocks = SlayerRewardsShop.filter(
									r => !r.item && !myUnlocks.includes(r.id)
								);
								return slayerUnlocks
									.filter(r =>
										!value
											? true
											: r.name.toLowerCase().includes(value) ||
												r.aliases?.some(alias =>
													alias.toLowerCase().includes(value.toLowerCase())
												)
									)
									.map(m => {
										return { name: m.name, value: m.name };
									});
							}
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
							autocomplete: async (value: string, user: User) => {
								const blockList = await mahojiUsersSettingsFetch(user.id, { slayer_blocked_ids: true });
								if (blockList.slayer_blocked_ids.length === 0) {
									return [{ name: "You don't have any monsters blocked", value: '' }];
								}
								const blockedMonsters = blockList.slayer_blocked_ids.map(
									mId => Monsters.find(m => m.id === mId)!
								);
								return blockedMonsters
									.filter(m => (!value ? true : m?.name.toLowerCase().includes(value.toLowerCase())))
									.map(m => {
										return { name: m?.name, value: m?.name };
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
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity to purchase, if applicable.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'my_unlocks',
					description: 'Show purchased unlocks',
					required: false
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'show_all_rewards',
					description: 'Show all rewards',
					required: false,
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'type',
							description: 'What type of rewards to show?',
							required: false,
							choices: ['all', 'buyables', 'unlocks'].map(t => {
								return { name: t, value: t };
							})
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'disable',
					description: 'Disable unlocks, extensions, etc. They will need to be repurchased.',
					required: false,
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'unlockable',
							description: 'Slayer unlock to disable',
							required: true,
							autocomplete: async (value: string, user: User) => {
								const mahojiUser = await mahojiUsersSettingsFetch(user.id, { slayer_unlocks: true });
								return SlayerRewardsShop.filter(
									r =>
										!r.item &&
										r.canBeRemoved &&
										mahojiUser.slayer_unlocks.includes(r.id) &&
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
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'status',
			description: 'Shows status of current slayer task'
		}
	],
	run: async ({
		options,
		channelID,
		userID,
		interaction
	}: CommandRunOptions<{
		autoslay?: { mode?: string; save?: boolean };
		new_task?: { master?: string; save?: boolean };
		manage?: {
			command: 'block' | 'skip' | 'list_blocks';
			new?: boolean;
		};
		rewards?: {
			unlock?: { unlockable: string };
			unblock?: { assignment: string };
			buy?: { item: string; quantity?: number };
			my_unlocks?: {};
			show_all_rewards?: { type?: 'all' | 'buyables' | 'unlocks' };
			disable?: { unlockable: string };
		};
		status?: {};
	}>) => {
		const mahojiUser = await mUserFetch(userID);

		await deferInteraction(interaction);
		if (options.autoslay) {
			autoSlayCommand({
				mahojiUser,
				channelID,
				modeOverride: options.autoslay.mode,
				saveMode: Boolean(options.autoslay.save),
				interaction
			});
			return null;
		}
		if (options.new_task) {
			slayerNewTaskCommand({
				userID: mahojiUser.id,
				interaction,
				channelID,
				slayerMasterOverride: options.new_task.master,
				saveDefaultSlayerMaster: Boolean(options.new_task.save),
				showButtons: true
			});
			return null;
		}
		if (options.manage) {
			if (options.manage.command === 'list_blocks') {
				return slayerListBlocksCommand(mahojiUser);
			}
			if (options.manage.command === 'skip' || options.manage.command === 'block') {
				slayerSkipTaskCommand({
					userID: mahojiUser.id,
					block: options.manage.command === 'block',
					newTask: Boolean(options.manage.new),
					interaction,
					channelID
				});
				return null;
			}
		}
		if (options.rewards) {
			if (options.rewards.my_unlocks) {
				return slayerShopListMyUnlocks(mahojiUser);
			}
			if (options.rewards.unblock) {
				return slayerUnblockCommand(mahojiUser, options.rewards.unblock.assignment);
			}
			if (options.rewards.show_all_rewards) {
				return slayerShopListRewards(options.rewards.show_all_rewards.type ?? 'all');
			}
			if (options.rewards.disable) {
				return slayerShopBuyCommand({
					userID: mahojiUser.id,
					disable: true,
					buyable: options.rewards.disable.unlockable,
					interaction
				});
			}
			if (options.rewards.buy) {
				return slayerShopBuyCommand({
					userID: mahojiUser.id,
					buyable: options.rewards.buy.item,
					quantity: options.rewards.buy.quantity,
					interaction
				});
			}
			if (options.rewards.unlock) {
				return slayerShopBuyCommand({
					userID: mahojiUser.id,
					buyable: options.rewards.unlock.unlockable,
					interaction
				});
			}
		}
		if (options.status) {
			return slayerStatusCommand(mahojiUser);
		}
		return 'This should not happen. Please contact support.';
	}
};
