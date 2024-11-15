import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { round } from 'e';

import type { OSBMahojiCommand } from '../lib/util';

export const dryCalcCommand: OSBMahojiCommand = {
	name: 'drycalc',
	description: 'Calculate your drystreak chance.',
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'drop_rate',
			description: 'The droprate, e.g: 1000 for 1 in 1000.',
			required: true,
			min_value: 1,
			max_value: 1_000_000_000
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'rolls',
			description: 'How many rolls you had at this drop.',
			required: true,
			min_value: 1,
			max_value: 1_000_000_000
		}
	],
	run: async ({ options }: CommandRunOptions<{ drop_rate: number; rolls: number }>) => {
		const dropRate = options.drop_rate;
		const { rolls } = options;
		const noDropChance = Math.pow(1 - 1 / dropRate, rolls);
		const dropChance = 100 * (1 - noDropChance);
		const output = `${rolls} rolls were done for a drop with a 1/${dropRate} (${round(
			100 / dropRate,
			2
		)}%) drop rate!\nYou had a **${round(
			noDropChance * 100,
			2
		)}%** chance of not receiving any drop, and a **${round(
			dropChance,
			2
		)}%** chance of receiving at least one drop.`;

		return output;
	}
};
