import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { diceCommand } from '../lib/abstracted_commands/diceCommand';
import { duelCommand } from '../lib/abstracted_commands/duelCommand';
import { luckyPickCommand } from '../lib/abstracted_commands/luckyPickCommand';
import { OSBMahojiCommand } from '../lib/util';
import { MahojiUserOption } from '../mahojiSettings';

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
					type: ApplicationCommandOptionType.String,
					name: 'amount',
					description: 'Amount you wish to gamble.',
					required: false
				}
			]
		},
		/**
		 *
		 * Duel
		 *
		 */
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'duel',
			description: 'Simulates dueling another player, or allows you to duel another player for their bot GP.',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user you want to duel.',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'amount',
					description: 'The GP you want to duel for.',
					required: false
				}
			]
		},
		/**
		 *
		 * Lucky Pick
		 *
		 */
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'lucky_pick',
			description: 'Allows you play lucky pick and risk your GP.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'amount',
					description: 'Amount you wish to gamble.',
					required: true
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'simulate',
					description: 'Simulate playing lucky pick.',
					required: false
				}
			]
		}
	],
	run: async ({
		options,
		interaction,
		userID
	}: CommandRunOptions<{
		dice?: { amount?: string };
		duel?: { user: MahojiUserOption; amount?: string };
		lucky_pick?: { amount: string; simulate: boolean };
	}>) => {
		const KlasaUser = await client.fetchUser(userID);

		/**
		 *
		 * Dice
		 *
		 */
		if (options.dice) {
			return diceCommand(KlasaUser, options.dice.amount);
		}
		/**
		 *
		 * Duel
		 *
		 */
		if (options.duel) {
			return duelCommand(
				KlasaUser,
				interaction,
				await client.fetchUser(options.duel.user.user.id),
				options.duel.amount
			);
		}
		/**
		 *
		 * Lucky Pick
		 *
		 */
		if (options.lucky_pick) {
			return luckyPickCommand(KlasaUser, options.lucky_pick.amount, options.lucky_pick.simulate, interaction);
		}
		return 'Invalid command.';
	}
};
