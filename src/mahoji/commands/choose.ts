import { inlineCode } from '@oldschoolgg/discord';

export const chooseCommand = defineCommand({
	name: 'choose',
	description: 'Have the bot make a choice from a list of things.',
	attributes: {
		examples: ['/choose list:First option, second option, third option']
	},
	options: [
		{
			type: 'String',
			name: 'list',
			description: 'The list of things to choose from, each separated by a comma.',
			required: true
		}
	],
	run: async ({ options, rng }) => {
		const list = options.list.split(',');
		if (list.length === 0) return "You didn't supply a list.";
		return {
			content: `Out of ${list
				.map(i => i.trim().replace(/`/g, ''))
				.map(inlineCode)
				.join(', ')}

I choose... **${rng.pick(list)}**.`,
			allowedMentions: { parse: [], roles: [], users: [] }
		};
	}
});
