import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { inlineCode } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { randArrItem } from 'e';

import type { OSBMahojiCommand } from '../lib/util';

export const chooseCommand: OSBMahojiCommand = {
	name: 'choose',
	description: 'Have the bot make a choice from a list of things.',
	attributes: {
		examples: ['/choose list:First option, second option, third option']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'list',
			description: 'The list of things to choose from, each separated by a comma.',
			required: true
		}
	],
	run: async ({ options }: CommandRunOptions<{ list: string }>) => {
		const list = options.list.split(',');
		if (list.length === 0) return "You didn't supply a list.";
		return {
			content: `Out of ${list
				.map(i => i.trim().replace(/`/g, ''))
				.map(inlineCode)
				.join(', ')}

I choose... **${randArrItem(list)}**.`,
			allowedMentions: { parse: [], roles: [], users: [] }
		};
	}
};
