import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../../';
import TrekShopItems from '../../lib/data/buyables/trekBuyables';
import { trek, trekShop } from '../../mahoji/lib/abstracted_commands/trekCommand';
import { OSBMahojiCommand } from '../lib/util';

export const trekCommand: OSBMahojiCommand = {
	name: 'trek',
	description: 'Send your minion to complete the temple trekking minigame',
	attributes: {
		categoryFlags: ['minion', 'minigame'],
		requiresMinion: true,
		description: 'Send your minion to complete the temple trekking minigame.',
		examples: ['/trek start easy', '/trek buy item']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Allows a player to start the temple trekking minigame.',
			options: [
				{
					name: 'difficulty',
					description: 'The item you want to purchase.',
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: [
						{
							name: 'Easy',
							value: 'Easy'
						},
						{
							name: 'Medium',
							value: 'Medium'
						},
						{
							name: 'Hard',
							value: 'Hard'
						}
					]
				},
				{
					name: 'quantity',
					description: 'The quantity you want to purchase.',
					type: ApplicationCommandOptionType.Integer,
					required: false,
					min_value: 1,
					max_value: 1000
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy',
			description: 'Allows a player to exchange reward tokens.',
			options: [
				{
					name: 'reward',
					description: 'The reward you want to purchase.',
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: async (value: string) => {
						return TrekShopItems.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					name: 'difficulty',
					description: 'The difficulty of token to use. Easy/Medium/Hard',
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: [
						{
							name: 'Easy',
							value: 'Easy'
						},
						{
							name: 'Medium',
							value: 'Medium'
						},
						{
							name: 'Hard',
							value: 'Hard'
						}
					]
				},

				{
					name: 'quantity',
					description: 'The quantity you want to purchase. Range: 1 - 1000',
					type: ApplicationCommandOptionType.Integer,
					required: false,
					min_value: 1,
					max_value: 100
				}
			]
		}
	],
	run: async ({
		channelID,
		options,
		interaction,
		userID
	}: CommandRunOptions<{
		start?: { difficulty: string; quantity?: number };
		buy?: { reward: string; difficulty: string; quantity?: number };
	}>) => {
		const user = await client.fetchUser(userID.toString());
		if (options.buy) {
			let { reward, difficulty, quantity } = options.buy!;
			return trekShop(user, reward, difficulty, quantity, interaction);
		}
		if (user.minionIsBusy) {
			return 'Your minion must not be busy to do a Temple Trekking trip';
		}
		let { difficulty, quantity } = options.start!;
		return trek(user, channelID, difficulty, quantity);
	}
};
