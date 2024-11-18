import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import type { OSBMahojiCommand } from '../lib/util';
import { bankCommand } from './bank';

const bankFormats = ['json', 'text_paged', 'text_full'] as const;
type BankFormat = (typeof bankFormats)[number];

export const bsCommand: OSBMahojiCommand = {
	name: 'bs',
	description: 'Search your minions bank.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'search',
			description: 'Search for item names in your bank.',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'format',
			description: 'The format to return your bank in.',
			required: false,
			choices: bankFormats.map(i => ({ name: i, value: i }))
		}
	],
	run: async (
		options: CommandRunOptions<{
			search?: string;
			format?: BankFormat;
		}>
	) => {
		const res = await bankCommand.run(options);
		return res;
	}
};
