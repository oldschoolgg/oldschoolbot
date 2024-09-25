import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import { cryptoRand } from '../../lib/util';
import type { OSBMahojiCommand } from '../lib/util';

export const rollCommand: OSBMahojiCommand = {
	name: 'roll',
	description: 'Roll a random number from 1, up to a limit.',
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'limit',
			description: 'The upper limit of the roll. Defaults to 10.',
			required: false,
			min_value: 1,
			max_value: 1_000_000_000
		}
	],
	run: async ({ options, user }: CommandRunOptions<{ limit?: number }>) => {
		const limit = options.limit ?? 10;
		return `**${user.username}** rolled a random number from 1 to ${limit}...\n\n**${cryptoRand(
			1,
			limit
		).toString()}**`;
	}
};
