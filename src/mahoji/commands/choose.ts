import { randArrItem } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { cleanMentions } from '../../lib/util';
import { OSBMahojiCommand } from '../lib/util';

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
	run: async ({ options, guildID }: CommandRunOptions<{ list: string }>) => {
		const guild = guildID ? globalClient.guilds.cache.get(guildID.toString()) : undefined;
		const list = options.list.split(',');
		if (list.length === 0) return "You didn't supply a list.";
		return `I choose... **${cleanMentions(guild ?? null, randArrItem(list))}**.`;
	}
};
