import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import TrekShopItems from '../../lib/data/buyables/trekBuyables';
import { LMSBuyables } from '../../lib/data/CollectionsExport';
import {
	agilityArenaBuyables,
	agilityArenaBuyCommand,
	agilityArenaCommand,
	agilityArenaRecolorCommand,
	agilityArenaXPCommand
} from '../lib/abstracted_commands/agilityArenaCommand';
import {
	barbAssaultBuyCommand,
	barbAssaultGambleCommand,
	barbAssaultLevelCommand,
	barbAssaultStartCommand,
	barbAssaultStatsCommand,
	BarbBuyables,
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
	mageTrainingArenaBuyables,
	mageTrainingArenaBuyCommand,
	mageTrainingArenaPointsCommand,
	mageTrainingArenaStartCommand
} from '../lib/abstracted_commands/mageTrainingArenaCommand';
import {
	mahoganyHomesBuildCommand,
	mahoganyHomesBuyables,
	mahoganyHomesBuyCommand
} from '../lib/abstracted_commands/mahoganyHomesCommand';
import {
	pestControlBuyables,
	pestControlBuyCommand,
	pestControlStartCommand,
	pestControlStatsCommand,
	pestControlXPCommand
} from '../lib/abstracted_commands/pestControlCommand';
import { pyramidPlunderCommand } from '../lib/abstracted_commands/pyramidPlunderCommand';
import { roguesDenCommand } from '../lib/abstracted_commands/roguesDenCommand';
import { sepulchreCommand } from '../lib/abstracted_commands/sepulchreCommand';
import {
	soulWarsBuyables,
	soulWarsBuyCommand,
	soulWarsImbueables,
	soulWarsImbueCommand,
	soulWarsStartCommand,
	soulWarsTokensCommand
} from '../lib/abstracted_commands/soulWarsCommand';
import { tearsOfGuthixCommand } from '../lib/abstracted_commands/tearsOfGuthixCommand';
import { trekCommand, trekShop } from '../lib/abstracted_commands/trekCommand';
import { troubleBrewingStartCommand } from '../lib/abstracted_commands/troubleBrewingCommand';
import {
	volcanicMineCommand,
	VolcanicMineShop,
	volcanicMineShopCommand
} from '../lib/abstracted_commands/volcanicMineCommand';
import { OSBMahojiCommand } from '../lib/util';

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
					name: 'buy',
					description: 'Purchase items with Honour points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							description: 'What item you wish to buy.',
							required: true,
							autocomplete: async (value: string) => {
								return BarbBuyables.filter(i =>
									!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({ name: i.item.name, value: i.item.name }));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity you want to purchase.',
							required: false,
							min_value: 1,
							max_value: 1000
						}
					]
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
			description: 'The Last Man Standing minigame.',
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
							description: 'The item to purchase.',
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
							description: 'The quantity to purchase.',
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
			description: 'The Pest Control minigame.',
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
			description: 'The Fishing Trawler minigame.',
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
			description: 'The Mage Arena 1 minigame.',
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
			description: 'The Mage Arena 2 minigame.',
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
			description: 'The Gnome Restaurant minigame.',
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
		 * Trek
		 *
		 */
		{
			name: 'temple_trek',
			description: 'The Temple Trekking minigame',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a temple trekking trip.',
					options: [
						{
							name: 'difficulty',
							description: 'The difficulty of the trek.',
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
							description: 'Amount of treks.',
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
							description: 'The reward to purchase.',
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
							description: 'The difficulty of token to use',
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
							description: 'The quantity you want to purchase',
							type: ApplicationCommandOptionType.Integer,
							required: false,
							min_value: 1,
							max_value: 1000
						}
					]
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
							description: 'Corrupted Gauntlet.',
							required: false
						}
					]
				}
			]
		},
		/**
		 *
		 * Mage Training Arena
		 *
		 */
		{
			name: 'mage_training_arena',
			description: 'Sends your minion to train at the Mage Training Arena.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Mage Training Arena trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'points',
					description: 'See your Mage Training Arena points.'
				},
				{
					name: 'buy',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Buy items with your Mage Training Arena points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							required: true,
							description: 'The item to buy.',
							autocomplete: async value => {
								return mageTrainingArenaBuyables
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
		 * Mahogany Homes
		 *
		 */
		{
			name: 'mahogany_homes',
			description: 'Sends your minion to do the Mahogany Homes minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Mahogany Homes trip.'
				},
				{
					name: 'buy',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Buy items with points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							required: true,
							description: 'The item to buy.',
							autocomplete: async value => {
								return mahoganyHomesBuyables
									.filter(i =>
										!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: i.item.name, value: i.item.name }));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity to purchase.',
							required: false,
							min_value: 1,
							max_value: 1000
						}
					]
				}
			]
		},
		/**
		 *
		 * Tears of Guthix
		 *
		 */
		{
			name: 'tears_of_guthix',
			description: 'Sends your minion to do the Tears of Guthix minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Tears of Guthix trip.'
				}
			]
		},
		/**
		 *
		 * Pyramid Plunder
		 *
		 */
		{
			name: 'pyramid_plunder',
			description: 'Sends your minion to do the Pyramid Plunder minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Pyramid Plunder trip.'
				}
			]
		},
		/**
		 *
		 * Rogues Den
		 *
		 */
		{
			name: 'rogues_den',
			description: 'Sends your minion to do the Rogues Den minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Rogues Den trip.'
				}
			]
		},
		/**
		 *
		 * Soul Wars
		 *
		 */
		{
			name: 'soul_wars',
			description: 'Sends your minion to do the Soul Wars minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Soul Wars trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'tokens',
					description: 'See how many Zeal tokens you have.'
				},
				{
					name: 'buy',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Buy items with Zeal Tokens.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							required: true,
							description: 'The item to buy.',
							autocomplete: async value => {
								return soulWarsBuyables
									.filter(i =>
										!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: i.item.name, value: i.item.name }));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The amount of items to buy.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					name: 'imbue',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Imbue items with Zeal Tokens.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							required: true,
							description: 'The item you to imbue.',
							autocomplete: async value => {
								return soulWarsImbueables
									.filter(i =>
										!value ? true : i.input.name.toLowerCase().includes(value.toLowerCase())
									)
									.map(i => ({ name: i.input.name, value: i.input.name }));
							}
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'volcanic_mine',
			description: 'The Volcanic Mine minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.',
					options: [
						{
							type: ApplicationCommandOptionType.Number,
							name: 'quantity',
							description: 'The amount of games to do.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'buy',
					description: 'Purchase a reward using reward points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'item',
							description: 'The item to buy.',
							required: true,
							autocomplete: async (value: string) => {
								return VolcanicMineShop.filter(i =>
									!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
								).map(i => ({ name: `${i.name}`, value: i.name }));
							}
						},
						{
							type: ApplicationCommandOptionType.Number,
							name: 'quantity',
							description: 'The amount to buy.',
							required: false,
							min_value: 1
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'agility_arena',
			description: 'The Brimhaven Agility Arena minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'buy',
					description: 'Purchase a reward.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'item',
							description: 'The item to buy.',
							required: true,
							choices: agilityArenaBuyables.map(i => ({ name: `${i.item.name}`, value: i.item.name }))
						},
						{
							type: ApplicationCommandOptionType.Number,
							name: 'quantity',
							description: 'The amount.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'recolor',
					description: 'Recolor your graceful using tickets.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'xp',
					description: 'Purchase XP using tickets.',
					options: [
						{
							type: ApplicationCommandOptionType.Number,
							name: 'quantity',
							description: 'The amount you want to buy.',
							required: true,
							choices: [1, 10, 25, 100, 1000].map(i => ({ name: i.toString(), value: i }))
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'trouble_brewing',
			description: 'The Trouble Brewing minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'gotr',
			description: 'The Guardians of the Rift minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
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
			buy?: { name: string; quantity?: number };
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
		temple_trek?: {
			start?: { difficulty: string; quantity?: number };
			buy?: { reward: string; difficulty: string; quantity?: number };
		};
		sepulchre?: { start?: {} };
		gauntlet?: { start?: { corrupted?: boolean } };
		mage_training_arena?: {
			start?: {};
			buy?: { name: string };
			points?: {};
		};
		mahogany_homes?: { start?: {}; buy?: { name: string; quantity?: number } };
		tears_of_guthix?: { start?: {} };
		pyramid_plunder?: { start?: {} };
		rogues_den?: { start?: {} };
		soul_wars?: { start?: {}; buy?: { name: string; quantity?: number }; imbue?: { name: string }; tokens?: {} };
		volcanic_mine?: {
			start?: { quantity?: number };
			buy?: { item: string; quantity?: number };
		};
		agility_arena?: {
			start?: {};
			buy?: { item: string; quantity?: number };
			recolor?: {};
			xp: { quantity: number };
		};
		trouble_brewing?: {
			start?: {};
		};
		gotr?: {
			start?: {};
		};
	}>) => {
		const user = await mUserFetch(userID);

		/**
		 *
		 * Barbarian Assault
		 *
		 */
		if (options.barb_assault?.start) {
			return barbAssaultStartCommand(channelID, user);
		}
		if (options.barb_assault?.buy) {
			return barbAssaultBuyCommand(
				interaction,
				user,
				options.barb_assault.buy.name,
				options.barb_assault.buy.quantity
			);
		}
		if (options.barb_assault?.level) {
			return barbAssaultLevelCommand(user);
		}
		if (options.barb_assault?.gamble) {
			return barbAssaultGambleCommand(
				interaction,
				user,
				options.barb_assault.gamble.tier,
				options.barb_assault.gamble.quantity
			);
		}
		if (options.barb_assault?.stats) {
			return barbAssaultStatsCommand(user.user);
		}

		/**
		 *
		 * Castle Wars
		 *
		 */
		if (options.castle_wars?.stats) {
			return castleWarsStatsCommand(user);
		}
		if (options.castle_wars?.start) {
			return castleWarsStartCommand(user, channelID);
		}

		/**
		 *
		 * LMS
		 *
		 */
		if (options.lms) return lmsCommand(options.lms, user, channelID, interaction);

		/**
		 *
		 * Pest Control
		 *
		 */
		if (options.pest_control?.stats) return pestControlStatsCommand(user.user);
		if (options.pest_control?.xp) {
			return pestControlXPCommand(
				interaction,
				user,
				options.pest_control.xp.skill,
				options.pest_control.xp.amount
			);
		}
		if (options.pest_control?.start) {
			return pestControlStartCommand(user, channelID);
		}
		if (options.pest_control?.buy) {
			return pestControlBuyCommand(user, options.pest_control.buy.name);
		}

		/**
		 *
		 * Fishing Trawler
		 *
		 */
		if (options.fishing_trawler?.start) return fishingTrawlerCommand(user, channelID);

		/**
		 *
		 * Mage Arena
		 *
		 */
		if (options.mage_arena?.start) return mageArenaCommand(user, channelID);

		/**
		 *
		 * Mage Arena 2
		 *
		 */
		if (options.mage_arena_2?.start) return mageArena2Command(user, channelID);

		/**
		 *
		 * Gnome Restaurant
		 *
		 */
		if (options.gnome_restaurant?.start) return gnomeRestaurantCommand(user, channelID);

		/**
		 *
		 * Trek
		 *
		 */
		if (options.temple_trek) {
			if (options.temple_trek.buy) {
				let { reward, difficulty, quantity } = options.temple_trek.buy!;
				return trekShop(user, reward, difficulty, quantity, interaction);
			}
			if (options.temple_trek.start) {
				let { difficulty, quantity } = options.temple_trek.start!;
				return trekCommand(user, channelID, difficulty, quantity);
			}
		}

		/**
		 *
		 * Sepulchre
		 *
		 */
		if (options.sepulchre?.start) return sepulchreCommand(user, channelID);

		/**
		 *
		 * Gauntlet
		 *
		 */
		if (options.gauntlet?.start) {
			return gauntletCommand(user, channelID, options.gauntlet.start.corrupted ? 'corrupted' : 'normal');
		}

		/**
		 *
		 * Mage Training Arena
		 *
		 */
		if (options.mage_training_arena) {
			if (options.mage_training_arena.buy) {
				return mageTrainingArenaBuyCommand(user, options.mage_training_arena.buy.name);
			}
			if (options.mage_training_arena.start) {
				return mageTrainingArenaStartCommand(user, channelID);
			}
			if (options.mage_training_arena.points) {
				return mageTrainingArenaPointsCommand(user);
			}
		}

		/**
		 *
		 * Mahogany Homes
		 *
		 */
		if (options.mahogany_homes) {
			if (options.mahogany_homes.buy) {
				return mahoganyHomesBuyCommand(
					user,
					options.mahogany_homes.buy.name,
					options.mahogany_homes.buy.quantity
				);
			}
			if (options.mahogany_homes.start) {
				return mahoganyHomesBuildCommand(user, channelID);
			}
		}

		/**
		 *
		 * Tears of Guthix
		 *
		 */
		if (options.tears_of_guthix) {
			return tearsOfGuthixCommand(user, channelID);
		}

		/**
		 *
		 * Pyramid Plunder
		 *
		 */
		if (options.pyramid_plunder) {
			return pyramidPlunderCommand(user, channelID);
		}

		/**
		 *
		 * Rogues Den
		 *
		 */
		if (options.rogues_den) {
			return roguesDenCommand(user, channelID);
		}

		/**
		 *
		 * Soul Wars
		 *
		 */
		if (options.soul_wars) {
			if (options.soul_wars.start) {
				return soulWarsStartCommand(user, channelID);
			}
			if (options.soul_wars.imbue) {
				return soulWarsImbueCommand(user, options.soul_wars.imbue.name);
			}
			if (options.soul_wars.buy) {
				return soulWarsBuyCommand(user, options.soul_wars.buy.name, options.soul_wars.buy.quantity);
			}
			if (options.soul_wars.tokens) {
				return soulWarsTokensCommand(user.user);
			}
		}

		/**
		 *
		 * Volcanic Mine
		 *
		 */
		if (options.volcanic_mine?.start) {
			return volcanicMineCommand(user, channelID, options.volcanic_mine.start.quantity);
		}
		if (options.volcanic_mine?.buy) {
			return volcanicMineShopCommand(
				interaction,
				user,
				options.volcanic_mine.buy.item,
				options.volcanic_mine.buy.quantity
			);
		}

		/**
		 *
		 * Agility Arena
		 *
		 */
		if (options.agility_arena?.start) {
			return agilityArenaCommand(user, channelID);
		}
		if (options.agility_arena?.buy) {
			return agilityArenaBuyCommand(user, options.agility_arena.buy.item, options.agility_arena.buy.quantity);
		}
		if (options.agility_arena?.recolor) {
			return agilityArenaRecolorCommand(user);
		}
		if (options.agility_arena?.xp) {
			return agilityArenaXPCommand(user, options.agility_arena.xp.quantity);
		}

		if (options.trouble_brewing) {
			return troubleBrewingStartCommand(user, channelID);
		}

		return 'Invalid command.';
	}
};
