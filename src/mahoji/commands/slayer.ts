import { Monsters } from 'oldschooljs';

import { choicesOf } from '@/discord/index.js';
import { autoslayChoices, slayerMasterChoices } from '@/lib/slayer/constants.js';
import { SlayerRewardsShop } from '@/lib/slayer/slayerUnlocks.js';
import { autoSlayCommand } from '@/mahoji/lib/abstracted_commands/autoSlayCommand.js';
import {
	slayerShopBuyCommand,
	slayerShopListMyUnlocks,
	slayerShopListRewards
} from '@/mahoji/lib/abstracted_commands/slayerShopCommand.js';
import {
	handleSlayerSkipListCommand,
	setSlayerAutoSkipBufferCommand,
	slayerMasterAutocomplete,
	slayerMonsterAutocomplete
} from '@/mahoji/lib/abstracted_commands/slayerSkipListCommand.js';
import {
	slayerListBlocksCommand,
	slayerNewTaskCommand,
	slayerSkipTaskCommand,
	slayerStatusCommand,
	slayerUnblockCommand
} from '@/mahoji/lib/abstracted_commands/slayerTaskCommand.js';

export const slayerCommand = defineCommand({
	name: 'slayer',
	description: 'Slayer skill commands',
	options: [
		{
			type: 'Subcommand',
			name: 'autoslay',
			description: 'Send your minion to slay your current task.',
			options: [
				{
					type: 'String',
					name: 'mode',
					description: 'Which autoslay mode do you want?',
					required: false,
					choices: autoslayChoices
				},
				{
					type: 'Boolean',
					name: 'save',
					description: 'Save your choice as default',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'new_task',
			description: 'Send your minion to slay your current task.',
			options: [
				{
					type: 'String',
					name: 'master',
					description: 'Which Slayer master do you want a task from?',
					required: false,
					choices: slayerMasterChoices
				},
				{
					type: 'Boolean',
					name: 'save',
					description: 'Save your choice as default',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'manage',
			description: 'Manage your current Slayer task.',
			options: [
				{
					type: 'String',
					name: 'command',
					description: 'Skip your current task',
					required: true,
					choices: choicesOf(['skip', 'block', 'list_blocks'])
				},
				{
					type: 'Boolean',
					name: 'new',
					description: 'Get a new task (if applicable)',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'skip_list',
			description: 'Manage automatic Slayer skip lists (Tier 2+ patrons).',
			options: [
				{
					type: 'String',
					name: 'action',
					description: 'Add, remove, or list skip entries',
					required: true,
					choices: choicesOf(['add', 'remove', 'list'])
				},
				{
					type: 'String',
					name: 'master',
					description: 'Slayer master to manage',
					required: false,
					autocomplete: async ({ value }: StringAutoComplete) => slayerMasterAutocomplete(value ?? '')
				},
				{
					type: 'String',
					name: 'monster',
					description: 'Monster to add or remove',
					required: false,
					autocomplete: async (ctx: StringAutoComplete) => slayerMonsterAutocomplete(ctx as any)
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'auto_skip_buffer',
			description: 'Set a Slayer points buffer for auto-skip (Tier 2+ patrons).',
			options: [
				{
					type: 'Integer',
					name: 'points',
					description: 'Minimum Slayer points to keep before stopping auto-skip',
					required: true,
					min_value: 0
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'rewards',
			description: 'Spend your Slayer rewards points.',
			options: [
				{
					type: 'Subcommand',
					name: 'unlock',
					description: 'Unlock tasks, extensions, cosmetics, etc',
					required: false,
					options: [
						{
							type: 'String',
							name: 'unlockable',
							description: 'Unlockable to purchase',
							required: true,
							autocomplete: async ({ value, user }: StringAutoComplete) => {
								const slayerUnlocks = SlayerRewardsShop.filter(
									r => !r.item && !user.user.slayer_unlocks.includes(r.id)
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
					type: 'Subcommand',
					name: 'unblock',
					description: 'Unblock a task',
					required: false,
					options: [
						{
							type: 'String',
							name: 'assignment',
							description: 'Assignment to unblock',
							required: true,
							autocomplete: async ({ value, user }: StringAutoComplete) => {
								if (user.user.slayer_blocked_ids.length === 0) {
									return [{ name: "You don't have any monsters blocked", value: '' }];
								}
								const blockedMonsters = user.user.slayer_blocked_ids.map(
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
					type: 'Subcommand',
					name: 'buy',
					description: 'Purchase something with points',
					required: false,
					options: [
						{
							type: 'String',
							name: 'item',
							description: 'Item to purchase',
							required: true,
							autocomplete: async ({ value }: StringAutoComplete) => {
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
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity to purchase, if applicable.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'my_unlocks',
					description: 'Show purchased unlocks',
					required: false
				},
				{
					type: 'Subcommand',
					name: 'show_all_rewards',
					description: 'Show all rewards',
					required: false,
					options: [
						{
							type: 'String',
							name: 'type',
							description: 'What type of rewards to show?',
							required: false,
							choices: choicesOf(['all', 'buyables', 'unlocks'])
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'disable',
					description: 'Disable unlocks, extensions, etc. They will need to be repurchased.',
					required: false,
					options: [
						{
							type: 'String',
							name: 'unlockable',
							description: 'Slayer unlock to disable',
							required: true,
							autocomplete: async ({ value, user }: StringAutoComplete) => {
								return SlayerRewardsShop.filter(
									r =>
										!r.item &&
										r.canBeRemoved &&
										user.user.slayer_unlocks.includes(r.id) &&
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
			type: 'Subcommand',
			name: 'status',
			description: 'Shows status of current slayer task'
		}
	],
	run: async ({ options, user, interaction }) => {
		await interaction.defer();
		if (options.autoslay) {
			return autoSlayCommand({
				user,
				modeOverride: options.autoslay.mode,
				saveMode: Boolean(options.autoslay.save),
				interaction
			});
		}
		if (options.new_task) {
			return slayerNewTaskCommand({
				user,
				interaction,
				slayerMasterOverride: options.new_task.master,
				saveDefaultSlayerMaster: Boolean(options.new_task.save),
				showButtons: true
			});
		}
		if (options.manage) {
			if (options.manage.command === 'list_blocks') {
				return slayerListBlocksCommand(user);
			}
			if (options.manage.command === 'skip' || options.manage.command === 'block') {
				return slayerSkipTaskCommand({
					user,
					block: options.manage.command === 'block',
					newTask: Boolean(options.manage.new),
					interaction
				});
			}
		}
		if (options.skip_list) {
			return handleSlayerSkipListCommand({
				user,
				action: options.skip_list.action,
				master: options.skip_list.master,
				monster: options.skip_list.monster
			});
		}
		if (options.auto_skip_buffer) {
			return setSlayerAutoSkipBufferCommand(user, options.auto_skip_buffer.points);
		}
		if (options.rewards) {
			if (options.rewards.my_unlocks) {
				return slayerShopListMyUnlocks(user);
			}
			if (options.rewards.unblock) {
				return slayerUnblockCommand(user, options.rewards.unblock.assignment);
			}
			if (options.rewards.show_all_rewards) {
				return slayerShopListRewards(options.rewards.show_all_rewards.type ?? 'all');
			}
			if (options.rewards.disable) {
				return slayerShopBuyCommand({
					user,
					disable: true,
					buyable: options.rewards.disable.unlockable,
					interaction
				});
			}
			if (options.rewards.buy) {
				return slayerShopBuyCommand({
					user,
					buyable: options.rewards.buy.item,
					quantity: options.rewards.buy.quantity,
					interaction
				});
			}
			if (options.rewards.unlock) {
				return slayerShopBuyCommand({
					user,
					buyable: options.rewards.unlock.unlockable,
					interaction
				});
			}
		}
		if (options.status) {
			return slayerStatusCommand(user);
		}
		return 'This should not happen. Please contact support.';
	}
});
