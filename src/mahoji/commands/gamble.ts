import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { capeGambleCommand, capeGambleStatsCommand } from '../lib/abstracted_commands/capegamble';
import { diceCommand } from '../lib/abstracted_commands/diceCommand';
import { duelCommand } from '../lib/abstracted_commands/duelCommand';
import { luckyPickCommand } from '../lib/abstracted_commands/luckyPickCommand';
import { slotsCommand } from '../lib/abstracted_commands/slots';
import { OSBMahojiCommand } from '../lib/util';
import { MahojiUserOption } from '../mahojiSettings';

export const gambleCommand: OSBMahojiCommand = {
	name: 'gamble',
	description: 'Partake in various gambling activities.',
	options: [
		/**
		 *
		 * Cape
		 *
		 */
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cape',
			description: 'Allows you to gamble fire/infernal capes for a chance at the pets.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'The cape you wish to gamble.',
					required: false,
					choices: [
						{ name: 'fire', value: 'fire' },
						{ name: 'infernal', value: 'infernal' }
					]
				}
			]
		},
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
				}
			]
		},
		/**
		 *
		 * Slots
		 *
		 */
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'slots',
			description: 'Allows you play slots and risk your GP.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'amount',
					description: 'Amount you wish to gamble.',
					required: true
				}
			]
		}
	],
	run: async ({
		options,
		interaction,
		userID
	}: CommandRunOptions<{
		cape?: { type?: string };
		dice?: { amount?: string };
		duel?: { user: MahojiUserOption; amount?: string };
		lucky_pick?: { amount: string };
		slots?: { amount: string };
	}>) => {
		const KlasaUser = await client.fetchUser(userID);

		/**
		 *
		 * Cape
		 *
		 */
		if (options.cape) {
			if (options.cape.type) {
				return capeGambleCommand(KlasaUser, options.cape.type, interaction);
			}
			return capeGambleStatsCommand(KlasaUser);
		}
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
			return luckyPickCommand(KlasaUser, options.lucky_pick.amount, interaction);
		}
		/**
		 *
		 * Slots
		 *
		 */
		if (options.slots) {
			return slotsCommand(KlasaUser, options.slots.amount, interaction);
		}
		return 'Invalid command.';
	}
};
