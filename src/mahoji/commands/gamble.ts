import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { MahojiUserOption } from 'mahoji/dist/lib/types';

import { capeGambleCommand, capeGambleStatsCommand } from '../lib/abstracted_commands/capegamble';
import { diceCommand } from '../lib/abstracted_commands/diceCommand';
import { duelCommand } from '../lib/abstracted_commands/duelCommand';
import { hotColdCommand } from '../lib/abstracted_commands/hotColdCommand';
import { luckyPickCommand } from '../lib/abstracted_commands/luckyPickCommand';
import { slotsCommand } from '../lib/abstracted_commands/slotsCommand';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

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
			description: 'Allows you play slots and risk your GP to win big.',
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
		 * Hot Cold
		 *
		 */
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'hot_cold',
			description: 'Allows you play Hot Cold and risk your GP to win big.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'choice',
					description: 'The flower type you want to guess.',
					required: false,
					choices: ['hot', 'cold'].map(i => ({ name: i, value: i }))
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'amount',
					description: 'Amount you wish to gamble.',
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
		cape?: { type?: string };
		dice?: { amount?: string };
		duel?: { user: MahojiUserOption; amount?: string };
		lucky_pick?: { amount: string };
		slots?: { amount?: string };
		hot_cold?: { choice?: 'hot' | 'cold'; amount?: string };
	}>) => {
		const klasaUser = await globalClient.fetchUser(userID);

		if (options.cape) {
			if (options.cape.type) {
				return capeGambleCommand(klasaUser, options.cape.type, interaction);
			}
			return capeGambleStatsCommand(klasaUser);
		}

		if (options.dice) {
			return diceCommand(klasaUser, options.dice.amount);
		}

		if (options.duel) {
			return duelCommand(
				klasaUser,
				interaction,
				await globalClient.fetchUser(options.duel.user.user.id),
				options.duel.amount
			);
		}

		if (options.lucky_pick) {
			return luckyPickCommand(klasaUser, options.lucky_pick.amount, interaction);
		}

		if (options.slots) {
			return slotsCommand(interaction, klasaUser, options.slots.amount);
		}

		const mahojiUser = await mahojiUsersSettingsFetch(klasaUser.id);

		if (options.hot_cold) {
			return hotColdCommand(interaction, klasaUser, mahojiUser, options.hot_cold.choice, options.hot_cold.amount);
		}
		return 'Invalid command.';
	}
};
