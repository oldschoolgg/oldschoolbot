import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { rumourCount, rumoursCommand } from '../../lib/skilling/skills/hunter/rumours/rumours';
import { type RumourOption, RumourOptions } from '../../lib/skilling/skills/hunter/rumours/util';
import type { OSBMahojiCommand } from '../lib/util';

export const rumourCommand: OSBMahojiCommand = {
	name: 'rumours',
	description: 'Various commands related to completing Hunter Rumours.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/rumours start tier:novice']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Send your minion to complete rumours for members of the Hunter Guild.',
			required: false,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'tier',
					description: 'The rumour tier you wish to be assigned. (Will default to the highest tier)',
					required: false,
					choices: RumourOptions.map(i => ({ value: i, name: i }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'count',
			description: 'View how many rumours you have completed.',
			required: false
		}
	],
	run: async ({
		userID,
		options
	}: CommandRunOptions<{
		task?: { tier?: RumourOption };
		view?: {};
	}>) => {
		if (options.task) {
			return rumoursCommand(userID, options.task.tier);
		} else {
			return rumourCount(userID);
		}
	}
};
