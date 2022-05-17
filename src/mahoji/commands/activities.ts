import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { KourendFavours } from '../../lib/minions/data/kourendFavour';
import { Planks } from '../../lib/minions/data/planks';
import Potions from '../../lib/minions/data/potions';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import { minionName } from '../../lib/util/minionUtils';
import { championsChallengeCommand } from '../lib/abstracted_commands/championsChallenge';
import { chargeGloriesCommand } from '../lib/abstracted_commands/chargeGloriesCommand';
import { chargeWealthCommand } from '../lib/abstracted_commands/chargeWealthCommand';
import { chompyHuntClaimCommand, chompyHuntCommand } from '../lib/abstracted_commands/chompyHuntCommand';
import { collectables, collectCommand } from '../lib/abstracted_commands/collectCommand';
import { decantCommand } from '../lib/abstracted_commands/decantCommand';
import { favourCommand } from '../lib/abstracted_commands/favourCommand';
import { fightCavesCommand } from '../lib/abstracted_commands/fightCavesCommand';
import { questCommand } from '../lib/abstracted_commands/questCommand';
import { sawmillCommand } from '../lib/abstracted_commands/sawmillCommand';
import { warriorsGuildCommand } from '../lib/abstracted_commands/warriorsGuildCommand';
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
		}
	],
	run: async ({
		options,
		channelID,
		userID
	}: CommandRunOptions<{
		sawmill?: { type: string; quantity?: number };
		chompy_hunt?: { action: 'start' | 'claim' };
		champions_challenge?: {};
		warriors_guild?: { action: string; quantity?: number };
		collect?: { item: string };
		quest?: {};
		favour?: { name?: string; no_stams?: boolean };
		decant?: { potion_name: string; dose?: number };
		charge?: { item: string; quantity?: number };
		fight_caves?: {};
	}>) => {
		const klasaUser = await client.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);

		// Minion can be busy
		if (options.decant) {
			return decantCommand(klasaUser, options.decant.potion_name, options.decant.dose);
		}

		// Minion must be free
		const isBusy = minionIsBusy(mahojiUser.id);
		const busyStr = `${minionName(mahojiUser)} is currently busy.`;
		if (isBusy) return busyStr;

		if (options.sawmill) {
			return sawmillCommand(klasaUser, options.sawmill.type, options.sawmill.quantity, channelID);
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
			return collectCommand(mahojiUser, klasaUser, channelID, options.collect.item);
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

		return 'Invalid command.';
	}
};
