import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { KourendFavours } from '../../lib/minions/data/kourendFavour';
import { Planks } from '../../lib/minions/data/planks';
import Potions from '../../lib/minions/data/potions';
import birdhouses from '../../lib/skilling/skills/hunter/birdHouseTrapping';
import { Castables } from '../../lib/skilling/skills/magic/castables';
import { Enchantables } from '../../lib/skilling/skills/magic/enchantables';
import Prayer from '../../lib/skilling/skills/prayer';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import { minionName } from '../../lib/util/minionUtils';
import { aerialFishingCommand } from '../lib/abstracted_commands/aerialFishingCommand';
import { alchCommand } from '../lib/abstracted_commands/alchCommand';
import { birdhouseCheckCommand, birdhouseHarvestCommand } from '../lib/abstracted_commands/birdhousesCommand';
import { buryCommand } from '../lib/abstracted_commands/buryCommand';
import { castCommand } from '../lib/abstracted_commands/castCommand';
import { championsChallengeCommand } from '../lib/abstracted_commands/championsChallenge';
import { chargeGloriesCommand } from '../lib/abstracted_commands/chargeGloriesCommand';
import { chargeWealthCommand } from '../lib/abstracted_commands/chargeWealthCommand';
import { chompyHuntClaimCommand, chompyHuntCommand } from '../lib/abstracted_commands/chompyHuntCommand';
import { collectables, collectCommand } from '../lib/abstracted_commands/collectCommand';
import { decantCommand } from '../lib/abstracted_commands/decantCommand';
import { driftNetCommand } from '../lib/abstracted_commands/driftNetCommand';
import { enchantCommand } from '../lib/abstracted_commands/enchantCommand';
import { favourCommand } from '../lib/abstracted_commands/favourCommand';
import { fightCavesCommand } from '../lib/abstracted_commands/fightCavesCommand';
import { infernoStartCommand, infernoStatsCommand } from '../lib/abstracted_commands/infernoCommand';
import puroOptions, { puroPuroStartCommand } from '../lib/abstracted_commands/puroPuroCommand';
import { questCommand } from '../lib/abstracted_commands/questCommand';
import { sawmillCommand } from '../lib/abstracted_commands/sawmillCommand';
import { warriorsGuildCommand } from '../lib/abstracted_commands/warriorsGuildCommand';
import { ownedItemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const activitiesCommand: OSBMahojiCommand = {
	name: 'activities',
	description: 'Miscellaneous activities you can do.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sawmill',
			description: 'Send your minion to the sawmill to turn logs into planks.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'type',
					description: 'The type of planks you want to make.',
					required: true,
					choices: Planks.map(i => ({ name: i.name, value: i.name }))
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity of planks you want to make.',
					required: false,
					min_value: 1
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'speed',
					description: 'The speed at which you want to make planks.',
					required: false,
					min_value: 1,
					max_value: 5
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'chompy_hunt',
			description: 'Send your minion to hunt Chompys.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'action',
					description: 'Start a Chompy hunting trip, or claim your hats.',
					choices: ['start', 'claim'].map(i => ({ name: i, value: i })),
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'champions_challenge',
			description: 'Send your minion to do the Champions Challenge.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'warriors_guild',
			description: 'Send your minion to the Warriors Guild.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'action',
					description: 'Start get tokens, or kill Cyclops for defenders.',
					choices: ['tokens', 'cyclops'].map(i => ({ name: i, value: i })),
					required: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to do (optional).',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'collect',
			description: 'Sends your minion to collect items.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to collect.',
					autocomplete: async (value: string) => {
						return collectables
							.filter(p => (!value ? true : p.item.name.toLowerCase().includes(value.toLowerCase())))
							.map(p => ({ name: p.item.name, value: p.item.name }));
					},
					required: true
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'no_stams',
					description: "Enable if you don't want to use stamina potions when collecting.",
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'quest',
			description: 'Send your minion to do quests.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'favour',
			description: 'Allows you to get Kourend Favour.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name of the Kourend House.',
					choices: KourendFavours.map(i => ({ name: i.name, value: i.name })),
					required: false
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'no_stams',
					description: "Enable if you don't want to use stamina potions when getting favour.",
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'decant',
			description: 'Allows you to decant potions into different dosages.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'potion_name',
					description: 'The name of the bank background you want.',
					autocomplete: async (value: string) => {
						return Potions.filter(p =>
							!value ? true : p.name.toLowerCase().includes(value.toLowerCase())
						).map(p => ({ name: p.name, value: p.name }));
					},
					required: true
				},
				{
					type: ApplicationCommandOptionType.Number,
					name: 'dose',
					description: 'The dosage to decant them too. (default 4)',
					required: false,
					min_value: 1,
					max_value: 4
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'charge',
			description: 'Allows you to charge glories, or rings of wealth.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to want',
					required: true,
					choices: [
						{
							name: 'Amulet of glory',
							value: 'glory'
						},
						{
							name: 'Ring of wealth',
							value: 'wealth'
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Number,
					name: 'quantity',
					description: 'The amount of inventories you want to charge.  (optional)',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'fight_caves',
			description: 'Allows you to fight TzTok-Jad and do the Fight Caves.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'inferno',
			description: 'Allows you to fight TzKal-Zuk and do the Inferno.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'action',
					description: 'The action you want to perform',
					required: true,
					choices: [
						{ name: 'Start Inferno Trip', value: 'start' },
						{ name: 'Check Inferno Stats', value: 'stats' }
					]
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'emerged',
					description: 'If you want this Inferno trip to be an Emerged Zuk trip.',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'birdhouses',
			description: 'Allows you to plant Birdhouse traps.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'action',
					description: 'The action you want to perform.',
					required: true,
					choices: [
						{ name: 'Check Birdhouses', value: 'check' },
						{ name: 'Collect and Plant Birdhouses', value: 'harvest' }
					]
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'birdhouse',
					description: 'The birdhouse you want to plant.',
					required: false,
					choices: birdhouses.map(i => ({ name: i.name, value: i.name }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'driftnet_fishing',
			description: 'The Drift Net fishing activity.',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'minutes',
					description: 'How many minutes you want to do (optional).',
					required: false,
					min_value: 1
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'no_stams',
					description: "Don't use stams?",
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'aerial_fishing',
			description: 'The Aerial Fishing activity.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'enchant',
			description: 'Enchant items, like jewellry and bolts.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The item you want to enchant.',
					required: true,
					autocomplete: async (value: string) => {
						return Enchantables.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to enchant.',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'bury',
			description: 'Bury bones!',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The item you want to enchant.',
					required: true,
					autocomplete: async (value: string) => {
						return Prayer.Bones.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to bury.',
					required: false,
					min_value: 1
				}
			]
		},

		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'puro_puro',
			description: 'Hunt implings in Puro-Puro.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'impling',
					description: 'The impling you want to hunt',
					required: true,
					choices: puroOptions.map(i => ({ name: i.name, value: i.name }))
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'dark_lure',
					description: 'Use the Dark Lure spell for increased implings?',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'alch',
			description: 'Alch items for GP.',
			options: [
				{
					...ownedItemOption(i => Boolean(i.highalch))
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to bury.',
					required: false,
					min_value: 1
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'speed',
					description: 'Alch faster, but use more runes.',
					required: false,
					min_value: 1,
					max_value: 5
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cast',
			description: 'Cast spells to train Magic.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'spell',
					description: 'The spell you want to cast.',
					required: true,
					autocomplete: async (value: string) => {
						return Castables.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to cast (Optional).',
					required: false,
					min_value: 1
				}
			]
		}
	],
	run: async ({
		options,
		channelID,
		userID,
		interaction
	}: CommandRunOptions<{
		sawmill?: { type: string; quantity?: number; speed?: number };
		chompy_hunt?: { action: 'start' | 'claim' };
		champions_challenge?: {};
		warriors_guild?: { action: string; quantity?: number };
		collect?: { item: string; no_stams?: boolean };
		quest?: {};
		favour?: { name?: string; no_stams?: boolean };
		decant?: { potion_name: string; dose?: number };
		charge?: { item: string; quantity?: number };
		fight_caves?: {};
		inferno?: { action: string; emerged?: boolean };
		birdhouses?: { action?: string; birdhouse?: string };
		driftnet_fishing?: { minutes?: number; no_stams?: boolean };
		aerial_fishing?: {};
		enchant?: { name: string; quantity?: number };
		bury?: { name: string; quantity?: number };
		puro_puro?: { impling: string; dark_lure?: boolean };
		alch?: { item: string; quantity?: number; speed?: number };
		cast?: { spell: string; quantity?: number };
	}>) => {
		const klasaUser = await globalClient.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);

		// Minion can be busy
		if (options.decant) {
			return decantCommand(klasaUser, options.decant.potion_name, options.decant.dose);
		}
		if (options.inferno?.action === 'stats') return infernoStatsCommand(klasaUser);
		if (options.birdhouses?.action === 'check') return birdhouseCheckCommand(mahojiUser);

		// Minion must be free
		const isBusy = minionIsBusy(mahojiUser.id);
		const busyStr = `${minionName(mahojiUser)} is currently busy.`;
		if (isBusy) return busyStr;

		if (options.birdhouses?.action === 'harvest') {
			return birdhouseHarvestCommand(klasaUser, mahojiUser, channelID, options.birdhouses.birdhouse);
		}
		if (options.inferno?.action === 'start')
			return infernoStartCommand(klasaUser, channelID, Boolean(options.inferno.emerged));
		if (options.sawmill) {
			return sawmillCommand(
				klasaUser,
				options.sawmill.type,
				options.sawmill.quantity,
				channelID,
				options.sawmill.speed
			);
		}
		if (options.chompy_hunt?.action === 'start') {
			return chompyHuntCommand(klasaUser, channelID);
		}
		if (options.chompy_hunt?.action === 'claim') {
			return chompyHuntClaimCommand(klasaUser);
		}
		if (options.champions_challenge) {
			return championsChallengeCommand(klasaUser, channelID);
		}
		if (options.warriors_guild) {
			return warriorsGuildCommand(
				klasaUser,
				channelID,
				options.warriors_guild.action,
				options.warriors_guild.quantity
			);
		}
		if (options.collect) {
			return collectCommand(mahojiUser, klasaUser, channelID, options.collect.item, options.collect.no_stams);
		}
		if (options.quest) {
			return questCommand(klasaUser, channelID);
		}
		if (options.favour) {
			return favourCommand(klasaUser, mahojiUser, options.favour.name, channelID, options.favour.no_stams);
		}
		if (options.charge?.item === 'glory') {
			return chargeGloriesCommand(klasaUser, channelID, options.charge.quantity);
		}
		if (options.charge?.item === 'wealth') {
			return chargeWealthCommand(klasaUser, channelID, options.charge.quantity);
		}
		if (options.fight_caves) {
			return fightCavesCommand(klasaUser, channelID);
		}
		if (options.driftnet_fishing) {
			return driftNetCommand(
				channelID,
				klasaUser,
				options.driftnet_fishing.minutes,
				options.driftnet_fishing.no_stams
			);
		}
		if (options.aerial_fishing) {
			return aerialFishingCommand(klasaUser, channelID);
		}
		if (options.enchant) {
			return enchantCommand(klasaUser, channelID, options.enchant.name, options.enchant.quantity);
		}
		if (options.bury) {
			return buryCommand(klasaUser, channelID, options.bury.name, options.bury.quantity);
		}
		if (options.alch) {
			return alchCommand(
				interaction,
				channelID,
				klasaUser,
				options.alch.item,
				options.alch.quantity,
				options.alch.speed
			);
		}
		if (options.puro_puro) {
			return puroPuroStartCommand(klasaUser, channelID, options.puro_puro.impling, options.puro_puro.dark_lure);
		}
		if (options.cast) {
			return castCommand(channelID, klasaUser, options.cast.spell, options.cast.quantity);
		}

		return 'Invalid command.';
	}
};
