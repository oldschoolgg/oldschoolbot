import { bankCommand } from '@/mahoji/commands/bank.js';

const bankFormats = ['json', 'text_paged', 'text_full'] as const;

export const bsCommand = defineCommand({
	name: 'bs',
	description: 'Search your minions bank.',
	options: [
		{
			type: 'String',
			name: 'search',
			description: 'Search for item names in your bank.',
			required: true
		},
		{
			type: 'String',
			name: 'format',
			description: 'The format to return your bank in.',
			required: false,
			choices: bankFormats.map(i => ({ name: i, value: i }))
		}
	],
	run: async options => {
		const res = await bankCommand.run(options);
		return res;
	}
});
