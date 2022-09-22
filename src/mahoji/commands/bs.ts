import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { OSBMahojiCommand } from '../lib/util';
import { bankCommand } from './bank';

export const bsCommand: OSBMahojiCommand = {
	name: 'bs',
	description: 'Search your minions bank.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'search',
			description: 'Search for item names in your bank.',
			required: true
		}
	],
	run: async (
		opts: CommandRunOptions<{
			search?: string;
		}>
	) => {
		const res = await bankCommand.run(opts);
		return res;
	}
};
