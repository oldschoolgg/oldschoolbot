import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { autoslayChoices, slayerMasterChoices } from '../../lib/slayer/constants';
import { OSBMahojiCommand } from '../lib/util';

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
					required: false
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'block',
					description: 'Block your current task.',
					required: false
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
							description: 'Assignment to block',
							required: true,
							autocomplete: async (value: string) => {
								// Todo: return matching blocked tasks for the user.
								return [{ name: 'test', value: `test-${value}` }];
							}
						}
					]
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
								// Todo:, return matching unlockables
								return [{ name: 'test', value: `test-${value}` }];
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
								// Todo:, return matching purchasables
								return [{ name: 'test', value: `test-${value}` }];
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'show',
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
		userID
	}: // , interaction
	CommandRunOptions<{
		autoslay?: { mode?: string; save?: boolean };
		task?: { master?: string; save?: boolean };
		manage?: { skip?: {}; block?: {}; unblock?: { assignment: string } };
		rewards?: { unlock?: { unlockable: string }; buy?: { item: string }; show?: {} };
	}>) => {
		console.log(options);
		console.log(`channel: ${channelID} - user: ${userID}`);
		return `${user.username} - ${JSON.stringify(options)}`;
	}
};
