import { randArrItem } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { OSBMahojiCommand } from '../lib/util';

export const askCommand: OSBMahojiCommand = {
	name: 'ask',
	description: 'Ask a yes/no question to the bot and receive an answer.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'question',
			description: 'The question you want to ask.',
			required: true
		}
	],
	run: async ({ member, options }: CommandRunOptions<{ question: string }>) => {
		const answer = randArrItem([
			'Yes.',
			'Definitely.',
			'Obviously yes.',
			'Without a doubt.',
			'I think so.',
			'100%.',

			"It's possible.",
			'Maybe.',

			'No.',
			'No chance.',
			'Unlikely.',
			'0 chance.',
			'No way.'
		]);
		return `${member.user.username} asked: *${options.question}*, and my answer is **${answer}**.`;
	}
};
