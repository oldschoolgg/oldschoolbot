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
			type: ApplicationCommandOptionType.Subcommand,
			name: 'manage',
			description: 'Manage your Slayer task/block list.',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'skip',
					description: 'Skip your current task',
					required: false
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'block',
					description: 'Block your current task.',
					required: false
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'unblock',
					description: 'Unblock a task',
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
		manage?: { skip?: boolean; block?: boolean; unblock?: string };
	}>) => {
		return `${user.username} asked: *${options.question}*, and my answer is **${answer}**.`;
	}
};
