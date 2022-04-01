import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { diceCommand } from '../lib/abstracted_commands/dice';
import { OSBMahojiCommand } from '../lib/util';

export const gambleCommand: OSBMahojiCommand = {
	name: 'gamble',
	description: 'Partake in various gambling activities.',
	options: [
		/**
		 *
		 * Dice
		 *
		 */
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'dice',
			description: 'Allows you to simulate dice rolls, or dice your bot GP.',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'amount',
					description: 'Amount you wish to gamble.'
				}
			]
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		dice?: { amount?: number };
	}>) => {
		const KlasaUser = await client.fetchUser(userID);

		/**
		 *
		 * Dice
		 *
		 */
		if (options.dice?.amount) {
			return diceCommand(KlasaUser, options.dice.amount);
		}
		return 'Invalid command.';
	}
};
