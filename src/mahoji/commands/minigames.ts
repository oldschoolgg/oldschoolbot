import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { LMSBuyables } from '../../lib/data/CollectionsExport';
import {
	barbAssaultGambleCommand,
	barbAssaultLevelCommand,
	barbAssaultStartCommand,
	barbAssaultStatsCommand,
	GambleTiers
} from '../lib/abstracted_commands/barbAssault';
import { castleWarsStartCommand, castleWarsStatsCommand } from '../lib/abstracted_commands/castleWarsCommand';
import { fishingTrawlerCommand } from '../lib/abstracted_commands/fishingTrawler';
import { gauntletCommand } from '../lib/abstracted_commands/gauntletCommand';
import { gnomeRestaurantCommand } from '../lib/abstracted_commands/gnomeRestaurantCommand';
import { lmsCommand } from '../lib/abstracted_commands/lmsCommand';
import { mageArena2Command } from '../lib/abstracted_commands/mageArena2Command';
import { mageArenaCommand } from '../lib/abstracted_commands/mageArenaCommand';
import {
	pestControlBuyables,
	pestControlBuyCommand,
	pestControlStartCommand,
	pestControlStatsCommand,
	pestControlXPCommand
} from '../lib/abstracted_commands/pestControlCommand';
import { sepulchreCommand } from '../lib/abstracted_commands/sepulchreCommand';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const minigamesCommand: OSBMahojiCommand = {
	name: 'minigames',
	description: 'Send your minion to do various minigames.',
	options: [
		/**
		 *
		 * Barbarian Assault
		 *
		 */
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'barb_assault',
			description: 'The Barbarian Assault minigame.',
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
		},
		/**
		 *
		 * Castle Wars
		 *
		 */
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'castle_wars',
			description: 'The Castle Wars minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'See your Castle Wars stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Castle Wars trip.'
				}
			]
		},
		/**
		 *
		 * LMS
		 *
		 */
		{
			name: 'lms',
			description: 'Sends your minion to do the Last Man Standing minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'See your Last Man Standing stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Last Man Standing Trip'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'buy',
					description: 'Buy a reward using your points.',
					options: [
						{
							name: 'name',
							description: 'The item you want to purchase.',
							type: ApplicationCommandOptionType.String,
							required: true,
							autocomplete: async (value: string) => {
								return LMSBuyables.filter(i =>
									!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({ name: i.item.name, value: i.item.name }));
							}
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
					name: 'simulate',
					description: 'Simulate a Last Man Standing game with your Discord friends.',
					options: [
						{
							name: 'names',
							description: 'Names. e.g. Magnaboy, Kyra, Alex',
							required: false,
							type: ApplicationCommandOptionType.String
						}
					]
				}
			]
		},
		/**
		 *
		 * Pest Control
		 *
		 */ {
			name: 'pest_control',
			description: 'Sends your minion to do the Pest Control minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'See your Pest Control stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Send your minion to do Pest Control games.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'xp',
					description: 'Buy XP with your Pest Control commendation games.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'skill',
							required: true,
							description: 'The skill you want XP in.',
							choices: ['attack', 'strength ', 'defence', 'hitpoints', 'ranged', 'magic', 'prayer'].map(
								i => ({ name: i, value: i })
							)
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'amount',
							description: 'The amount of points you want to spend.',
							min_value: 1,
							max_value: 1000
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'buy',
					description: 'Buy items with your Pest Control commendation games.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							required: true,
							description: 'The skill you want XP in.',
							autocomplete: async value => {
								return pestControlBuyables
									.filter(i =>
										!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: i.item.name, value: i.item.name }));
							}
						}
					]
				}
			]
		},
		/**
		 *
		 * Fishing Trawler
		 *
		 */ {
			name: 'fishing_trawler',
			description: 'Sends your minion to do the Fishing Trawler minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Fishing Trawler trip.'
				}
			]
		},
		/**
		 *
		 * Mage Arena 1
		 *
		 */
		{
			name: 'mage_arena',
			description: 'Sends your minion to do the Mage Arena 1 minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Mage Arena 1 trip.'
				}
			]
		},
		/**
		 *
		 * Mage Arena 2
		 *
		 */
		{
			name: 'mage_arena_2',
			description: 'Sends your minion to do the Mage Arena 2 minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Mage Arena 2 trip.'
				}
			]
		},
		/**
		 *
		 * Gnome Restaurant
		 *
		 */
		{
			name: 'gnome_restaurant',
			description: 'Sends your minion to do the Gnome Restaurant minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Gnome Restaurant trip.'
				}
			]
		},
		/**
		 *
		 * Sepulchre
		 *
		 */
		{
			name: 'sepulchre',
			description: 'Sends your minion to do the Hallowed Sepulchre minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Hallowed Sepulchre trip.'
				}
			]
		},
		/**
		 *
		 * Gauntlet
		 *
		 */
		{
			name: 'gauntlet',
			description: 'Sends your minion to do the Gauntlet minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Gauntlet trip.',
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'corrupted',
							description: 'If you want to do Corrupted Gauntlet.',
							required: false
						}
					]
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
		castle_wars?: { stats?: {}; start?: {} };
		lms?: {
			stats?: {};
			start?: {};
			buy?: { name?: string; quantity?: number };
			simulate?: { names?: string };
		};
		pest_control?: {
			stats?: {};
			xp?: { skill: string; amount: number };
			start?: {};
			buy?: { name: string };
		};
		fishing_trawler?: { start?: {} };
		mage_arena?: { start?: {} };
		mage_arena_2?: { start?: {} };
		gnome_restaurant?: { start?: {} };
		sepulchre?: { start?: {} };
		gauntlet?: { start?: { corrupted?: boolean } };
	}>) => {
		const klasaUser = await client.fetchUser(userID);
		const user = await mahojiUsersSettingsFetch(userID);

		/**
		 *
		 * Barbarian Assault
		 *
		 */
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

		/**
		 *
		 * Castle Wars
		 *
		 */
		if (options.castle_wars?.stats) {
			return castleWarsStatsCommand(klasaUser);
		}
		if (options.castle_wars?.start) {
			return castleWarsStartCommand(klasaUser, channelID);
		}

		/**
		 *
		 * LMS
		 *
		 */
		if (options.lms) return lmsCommand(options.lms, klasaUser, channelID, interaction);

		/**
		 *
		 * Pest Control
		 *
		 */
		if (options.pest_control?.stats) return pestControlStatsCommand(user);
		if (options.pest_control?.xp) {
			return pestControlXPCommand(
				interaction,
				klasaUser,
				user,
				options.pest_control.xp.skill,
				options.pest_control.xp.amount
			);
		}
		if (options.pest_control?.start) {
			return pestControlStartCommand(klasaUser, channelID);
		}
		if (options.pest_control?.buy) {
			return pestControlBuyCommand(klasaUser, user, options.pest_control.buy.name);
		}

		/**
		 *
		 * Fishing Trawler
		 *
		 */
		if (options.fishing_trawler?.start) return fishingTrawlerCommand(klasaUser, channelID);

		/**
		 *
		 * Mage Arena
		 *
		 */
		if (options.mage_arena?.start) return mageArenaCommand(klasaUser, channelID);

		/**
		 *
		 * Mage Arena 2
		 *
		 */
		if (options.mage_arena_2?.start) return mageArena2Command(klasaUser, channelID);

		/**
		 *
		 * Gnome Restaurant
		 *
		 */
		if (options.gnome_restaurant?.start) return gnomeRestaurantCommand(klasaUser, channelID);

		/**
		 *
		 * Sepulchre
		 *
		 */
		if (options.sepulchre?.start) return sepulchreCommand(klasaUser, channelID);

		/**
		 *
		 * Gauntlet
		 *
		 */
		if (options.gauntlet?.start)
			return gauntletCommand(klasaUser, channelID, options.gauntlet.start.corrupted ? 'corrupted' : 'normal');
		return 'Invalid command.';
	}
};
