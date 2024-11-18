import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import { LMSBuyables } from '../../lib/data/CollectionsExport';
import TrekShopItems from '../../lib/data/buyables/trekBuyables';
import {
	agilityArenaBuyCommand,
	agilityArenaBuyables,
	agilityArenaCommand,
	agilityArenaXPCommand
} from '../lib/abstracted_commands/agilityArenaCommand';
import {
	BarbBuyables,
	GambleTiers,
	barbAssaultBuyCommand,
	barbAssaultGambleCommand,
	barbAssaultLevelCommand,
	barbAssaultStartCommand,
	barbAssaultStatsCommand
} from '../lib/abstracted_commands/barbAssault';
import { castleWarsStartCommand, castleWarsStatsCommand } from '../lib/abstracted_commands/castleWarsCommand';
import { fishingTrawlerCommand } from '../lib/abstracted_commands/fishingTrawler';
import { gauntletCommand } from '../lib/abstracted_commands/gauntletCommand';
import {
	giantsFoundryShopCommand,
	giantsFoundryStartCommand,
	giantsFoundryStatsCommand
} from '../lib/abstracted_commands/giantsFoundryCommand';
import { gnomeRestaurantCommand } from '../lib/abstracted_commands/gnomeRestaurantCommand';
import { guardiansOfTheRiftStartCommand } from '../lib/abstracted_commands/guardiansOfTheRiftCommand';
import { lmsCommand } from '../lib/abstracted_commands/lmsCommand';
import { mageArena2Command } from '../lib/abstracted_commands/mageArena2Command';
import { mageArenaCommand } from '../lib/abstracted_commands/mageArenaCommand';
import {
	mageTrainingArenaBuyCommand,
	mageTrainingArenaBuyables,
	mageTrainingArenaPointsCommand,
	mageTrainingArenaStartCommand
} from '../lib/abstracted_commands/mageTrainingArenaCommand';
import {
	contractTiers,
	mahoganyHomesBuildCommand,
	mahoganyHomesBuyCommand,
	mahoganyHomesBuyables,
	mahoganyHomesPointsCommand
} from '../lib/abstracted_commands/mahoganyHomesCommand';
import {
	nightmareZoneShopCommand,
	nightmareZoneStartCommand,
	nightmareZoneStatsCommand
} from '../lib/abstracted_commands/nightmareZoneCommand';
import {
	pestControlBuyCommand,
	pestControlBuyables,
	pestControlStartCommand,
	pestControlStatsCommand,
	pestControlXPCommand
} from '../lib/abstracted_commands/pestControlCommand';
import { pyramidPlunderCommand } from '../lib/abstracted_commands/pyramidPlunderCommand';
import { roguesDenCommand } from '../lib/abstracted_commands/roguesDenCommand';
import { sepulchreCommand } from '../lib/abstracted_commands/sepulchreCommand';
import { shades, shadesLogs, shadesOfMortonStartCommand } from '../lib/abstracted_commands/shadesOfMortonCommand';
import {
	soulWarsBuyCommand,
	soulWarsBuyables,
	soulWarsImbueCommand,
	soulWarsImbueables,
	soulWarsStartCommand,
	soulWarsTokensCommand
} from '../lib/abstracted_commands/soulWarsCommand';
import { tearsOfGuthixCommand } from '../lib/abstracted_commands/tearsOfGuthixCommand';
import { trekCommand, trekShop } from '../lib/abstracted_commands/trekCommand';
import { troubleBrewingStartCommand } from '../lib/abstracted_commands/troubleBrewingCommand';
import {
	VolcanicMineShop,
	volcanicMineCommand,
	volcanicMineShopCommand,
	volcanicMineStatsCommand
} from '../lib/abstracted_commands/volcanicMineCommand';
import type { OSBMahojiCommand } from '../lib/util';
import type { NMZStrategy } from './../../lib/constants';
import { NMZ_STRATEGY } from './../../lib/constants';
import { giantsFoundryAlloys, giantsFoundryBuyables } from './../lib/abstracted_commands/giantsFoundryCommand';
import {
	nightmareZoneBuyables,
	nightmareZoneImbueCommand,
	nightmareZoneImbueables
} from './../lib/abstracted_commands/nightmareZoneCommand';

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
					description: 'Start a trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'buy',
					description: 'Purchase items with Honour points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							description: 'The item to buy.',
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
							description: 'Quantity.',
							required: false,
							min_value: 1,
							max_value: 1000
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'level',
					description: 'Level up Honour Level with Honour points.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'gamble',
					description: 'Gamble for rewards with Honour points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'tier',
							description: 'What tier of gamble to do.',
							required: true,
							choices: GambleTiers.map(i => ({ name: i.name, value: i.name }))
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The amount of gambles to do.',
							required: true,
							min_value: 1
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Show Barbarian Assault stats.'
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
					description: 'Show Castle Wars stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
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
					description: 'Show Last Man Standing stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Trip'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'buy',
					description: 'Buy a reward using points.',
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
							description: 'Quantity.',
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
					description: 'Simulate a Last Man Standing game with Discord friends.',
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
					description: 'Show Pest Control stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'xp',
					description: 'Buy XP using Pest Control commendation games.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'skill',
							required: true,
							description: 'The skill to put XP in.',
							choices: ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'prayer'].map(
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
					description: 'Start a trip.'
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
					description: 'Start a trip.'
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
					description: 'Start a trip.'
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
					description: 'Start a trip.'
				}
			]
		},
		/**
		 *
		 * The Temple Trekking
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
					description: 'Start a trip.',
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
					description: 'Exchange reward tokens.',
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
							description: 'Quantity',
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
			description: 'The Hallowed Sepulchre minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
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
			description: 'The Gauntlet minigame.',
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
			description: 'The Mage Training Arena minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'points',
					description: 'Mage Training Arena point balance.'
				},
				{
					name: 'buy',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Buy items with Mage Training Arena points.',
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
			description: 'The Mahogany Homes minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'tier',
							required: false,
							description: 'The tier contract you wish to do.',
							autocomplete: async value => {
								return contractTiers
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: i.name, value: i.tier }));
							}
						}
					]
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
							description: 'Quantity.',
							required: false,
							min_value: 1,
							max_value: 1000
						}
					]
				},
				{
					name: 'points',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Mahogany Homes point balance.'
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
			description: 'The Tears of Guthix minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
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
			description: 'The Pyramid Plunder minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
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
			description: 'The Rogues Den minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
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
			description: 'The Soul Wars minigame.',
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'tokens',
					description: 'Zeal token balance.'
				},
				{
					name: 'buy',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Buy using Zeal Tokens.',
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
							description: 'Quantity.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					name: 'imbue',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Imbue using Zeal Tokens.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							required: true,
							description: 'The item to imbue.',
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
							type: ApplicationCommandOptionType.Integer,
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
					description: 'Purchase using reward points.',
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
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'Quantity.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Show Volcanic Mine stats.'
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
					description: 'Start a trip.',
					options: [
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'Amount of brimhaven agility course laps you want to do.',
							required: false,
							min_value: 1
						}
					]
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
							choices: agilityArenaBuyables.map(i => ({ name: `${i.name}`, value: i.name }))
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'Quantity.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'xp',
					description: 'Purchase XP using tickets.',
					options: [
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'Quantity.',
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
			name: 'giants_foundry',
			description: "The Giants' Foundry minigame.",
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							description: 'The alloy/metal to use.',
							required: true,
							autocomplete: async value => {
								return giantsFoundryAlloys
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: i.name, value: i.name }));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The amount of weapons to make.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					name: 'buy',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Buy items with Foundry Reputation.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'item',
							description: 'The item to buy.',
							required: false,
							autocomplete: async (value: string) => {
								return giantsFoundryBuyables
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: `${i.name}`, value: i.name }));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'Quantity.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					name: 'stats',
					type: ApplicationCommandOptionType.Subcommand,
					description: "Giants' Foundry stats"
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
					description: 'Start a trip.',
					options: [
						{
							name: 'combination_runes',
							description: 'Craft combination runes for extra points.',
							type: ApplicationCommandOptionType.Boolean,
							required: false
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'nmz',
			description: 'The Nightmare Zone minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'strategy',
							description: 'The strategy to use.',
							required: true,
							choices: NMZ_STRATEGY.map(i => ({ name: i, value: i }))
						}
					]
				},
				{
					name: 'buy',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Buy items with Nightmare Zone points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'item',
							description: 'The item to buy.',
							required: false,
							autocomplete: async (value: string) => {
								return nightmareZoneBuyables
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({ name: `${i.name}`, value: i.name }));
							}
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'Quantity.',
							required: false,
							min_value: 1
						}
					]
				},
				{
					name: 'stats',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Nightmare Zone stats'
				},
				{
					name: 'imbue',
					type: ApplicationCommandOptionType.Subcommand,
					description: 'Imbue using Nightmare Zone points.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'name',
							required: true,
							description: 'The item to imbue.',
							autocomplete: async value => {
								return nightmareZoneImbueables
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
			name: 'shades_of_morton',
			description: "The Shades of Mort'ton minigame.",
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a trip.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'shade',
							description: 'The shade you want to use.',
							required: true,
							choices: shades.map(i => ({ name: i.shadeName, value: i.shadeName }))
						},
						{
							name: 'logs',
							description: 'The logs you want to use.',
							type: ApplicationCommandOptionType.String,
							required: true,
							choices: shadesLogs.map(i => ({ name: i.normalLog.name, value: i.normalLog.name }))
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
		mahogany_homes?: {
			start?: { tier?: number };
			buy?: { name: string; quantity?: number };
			points?: {};
		};
		tears_of_guthix?: { start?: {} };
		pyramid_plunder?: { start?: {} };
		rogues_den?: { start?: {} };
		soul_wars?: { start?: {}; buy?: { name: string; quantity?: number }; imbue?: { name: string }; tokens?: {} };
		volcanic_mine?: {
			start?: { quantity?: number };
			buy?: { item: string; quantity?: number };
			stats?: {};
		};
		agility_arena?: {
			start?: { quantity?: number };
			buy?: { item: string; quantity?: number };
			recolor?: {};
			xp: { quantity: number };
		};
		trouble_brewing?: {
			start?: {};
		};
		giants_foundry?: {
			start?: { name: string; quantity?: number };
			buy?: { item: string; quantity?: number };
			stats?: {};
		};
		gotr?: {
			start?: { combination_runes?: boolean };
		};
		nmz?: {
			start?: { strategy: NMZStrategy };
			buy?: { item: string; quantity?: number };
			stats?: {};
			imbue?: { name: string };
		};
		shades_of_morton?: {
			start?: {
				shade: string;
				logs: string;
			};
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
			return barbAssaultStatsCommand(user);
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
		if (options.pest_control?.stats) return pestControlStatsCommand(user);
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
		 * The Temple Trekking
		 *
		 */
		if (options.temple_trek) {
			if (options.temple_trek.buy) {
				const { reward, difficulty, quantity } = options.temple_trek.buy!;
				return trekShop(user, reward, difficulty, quantity, interaction);
			}
			if (options.temple_trek.start) {
				const { difficulty, quantity } = options.temple_trek.start!;
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
				return mahoganyHomesBuildCommand(user, channelID, options.mahogany_homes.start.tier);
			}
			if (options.mahogany_homes.points) {
				return mahoganyHomesPointsCommand(user);
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
		if (options.volcanic_mine?.stats) {
			return volcanicMineStatsCommand(user);
		}

		/**
		 *
		 * Agility Arena
		 *
		 */
		if (options.agility_arena?.start) {
			return agilityArenaCommand(user, channelID, options.agility_arena.start.quantity);
		}
		if (options.agility_arena?.buy) {
			return agilityArenaBuyCommand(user, options.agility_arena.buy.item, options.agility_arena.buy.quantity);
		}
		if (options.agility_arena?.xp) {
			return agilityArenaXPCommand(user, options.agility_arena.xp.quantity);
		}

		/**
		 *
		 * Trouble Brewing
		 *
		 */
		if (options.trouble_brewing) {
			return troubleBrewingStartCommand(user, channelID);
		}

		/**
		 *
		 * Giants' Foundry
		 *
		 */
		if (options.giants_foundry?.start) {
			return giantsFoundryStartCommand(
				user,
				options.giants_foundry.start.name,
				options.giants_foundry.start.quantity,
				channelID
			);
		}
		if (options.giants_foundry?.buy) {
			return giantsFoundryShopCommand(
				interaction,
				user,
				options.giants_foundry.buy.item,
				options.giants_foundry.buy.quantity
			);
		}
		if (options.giants_foundry?.stats) return giantsFoundryStatsCommand(user);

		/**
		 *
		 * Guardians Of The Rift
		 *
		 */
		if (options.gotr) {
			return guardiansOfTheRiftStartCommand(user, channelID, options.gotr.start?.combination_runes);
		}

		/**
		 *
		 * Nightmare Zone
		 *
		 */
		if (options.nmz?.start) {
			return nightmareZoneStartCommand(user, options.nmz.start.strategy, channelID);
		}
		if (options.nmz?.buy) {
			return nightmareZoneShopCommand(interaction, user, options.nmz.buy.item, options.nmz.buy.quantity);
		}
		if (options.nmz?.stats) return nightmareZoneStatsCommand(user);
		if (options.nmz?.imbue) {
			return nightmareZoneImbueCommand(user, options.nmz.imbue.name);
		}

		/**
		 *
		 * Shades of Morton
		 *
		 */
		if (options.shades_of_morton?.start) {
			return shadesOfMortonStartCommand(
				user,
				channelID,
				options.shades_of_morton.start.logs,
				options.shades_of_morton.start.shade
			);
		}

		return 'Invalid command.';
	}
};
