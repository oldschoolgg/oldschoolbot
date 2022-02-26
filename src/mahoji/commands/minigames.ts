import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import {
	barbAssaultGambleCommand,
	barbAssaultLevelCommand,
	barbAssaultStartCommand,
	barbAssaultStatsCommand,
	GambleTiers
} from '../lib/abstracted_commands/barbAssault';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const minigamesCommand: OSBMahojiCommand = {
	name: 'minigames',
	description: 'Send your minion to do various minigames.',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'barb_assault',
			description: 'The Barbarian Assault minigame. (Solo)',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Barbarian Assault trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'level',
					description: 'Level up your Honour Level with Honour points.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'gamble',
					description: 'Gamble for rewards with Honour points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'tier',
							description: 'What tier of gamble you want to do.',
							required: true,
							choices: GambleTiers.map(i => ({ name: i.name, value: i.name }))
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The amount of gambles you want to do.',
							required: true,
							min_value: 1
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'See your Barbarian Assault stats.'
				}
			]
		}
	],
	run: async ({
		interaction,
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		barb_assault?: {
			start?: { quantity?: number };
			level?: {};
			gamble?: { tier: string; quantity: number };
			stats?: {};
		};
	}>) => {
		const klasaUser = await client.fetchUser(userID);
		const user = await mahojiUsersSettingsFetch(userID);
		if (options.barb_assault?.start) {
			return barbAssaultStartCommand(channelID, user, klasaUser);
		}
		if (options.barb_assault?.level) {
			return barbAssaultLevelCommand(user);
		}
		if (options.barb_assault?.gamble) {
			return barbAssaultGambleCommand(
				interaction,
				klasaUser,
				user,
				options.barb_assault.gamble.tier,
				options.barb_assault.gamble.quantity
			);
		}
		if (options.barb_assault?.stats) {
			return barbAssaultStatsCommand(user);
		}

		return 'Invalid command.';
	}
};
