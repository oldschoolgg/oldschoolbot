import { cryptoRng } from '@oldschoolgg/rng';

export const rollCommand: OSBMahojiCommand = {
	name: 'roll',
	description: 'Roll a random number from 1, up to a limit.',
	options: [
		{
			type: 'Integer',
			name: 'limit',
			description: 'The upper limit of the roll. Defaults to 10.',
			required: false,
			min_value: 1,
			max_value: 1_000_000_000
		}
	],
	run: async ({ options, user }: CommandRunOptions<{ limit?: number }>) => {
		const limit = options.limit ?? 10;
		return `**${user.username}** rolled a random number from 1 to ${limit}...\n\n**${cryptoRng
			.randInt(1, limit)
			.toString()}**`;
	}
};
