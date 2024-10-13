import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import type { RaidLevel } from '../../lib/simulation/toa';
import { mileStoneBaseDeathChances, toaHelpCommand, toaStartCommand } from '../../lib/simulation/toa';
import { deferInteraction } from '../../lib/util/interactionReply';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import { coxBoostsCommand, coxCommand, coxStatsCommand } from '../lib/abstracted_commands/coxCommand';
import { tobCheckCommand, tobStartCommand, tobStatsCommand } from '../lib/abstracted_commands/tobCommand';
import type { OSBMahojiCommand } from '../lib/util';

export const raidCommand: OSBMahojiCommand = {
	name: 'raid',
	description: 'Send your minion to do raids - CoX or ToB.',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'cox',
			description: 'The Chambers of Xeric.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Chambers of Xeric trip',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'type',
							description: 'Choose whether you want to solo, mass, or fake mass.',
							choices: ['solo', 'mass', 'fakemass'].map(i => ({ name: i, value: i })),
							required: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'challenge_mode',
							description: 'Choose whether you want to do Challenge Mode.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 10
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Check your CoX stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'itemboosts',
					description: 'Check your CoX item boosts.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'tob',
			description: 'The Theatre of Blood.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Theatre of Blood trip',
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'solo',
							description: 'Solo with a team of 3 bots.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'hard_mode',
							description: 'Choose whether you want to do Hard Mode.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 10
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'stats',
					description: 'Check your ToB stats.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'check',
					description: "Check if you're ready for ToB.",
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'hard_mode',
							description: 'Choose whether you want to check Hard Mode.',
							required: false
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'toa',
			description: 'The Tombs of Amascut.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Tombs of Amascut trip',
					options: [
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'raid_level',
							description: 'Choose the raid level you want to do (1-600).',
							required: true,
							choices: mileStoneBaseDeathChances.map(i => ({
								name: i.level.toString(),
								value: i.level
							}))
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'solo',
							description: 'Do you want to solo?',
							required: false
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false,
							min_value: 1,
							max_value: 8
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 5
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'help',
					description: 'Shows helpful information and stats about TOA.'
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
		cox?: {
			start?: {
				type: 'solo' | 'mass' | 'fakemass';
				challenge_mode?: boolean;
				max_team_size?: number;
				quantity?: number;
			};
			stats?: {};
			itemboosts?: {};
		};
		tob?: {
			start?: { solo?: boolean; hard_mode?: boolean; max_team_size?: number; quantity?: number };
			stats?: {};
			check?: { hard_mode?: boolean };
		};
		toa?: {
			start?: { raid_level: RaidLevel; max_team_size?: number; solo?: boolean; quantity?: number };
			help?: {};
		};
	}>) => {
		if (interaction) await deferInteraction(interaction);
		const user = await mUserFetch(userID);
		const { cox, tob } = options;
		if (cox?.stats) return coxStatsCommand(user);
		if (cox?.itemboosts) return coxBoostsCommand(user);
		if (tob?.stats) return tobStatsCommand(user);
		if (tob?.check) return tobCheckCommand(user, Boolean(tob.check.hard_mode));
		if (options.toa?.help) return toaHelpCommand(user, channelID);

		if (minionIsBusy(user.id)) return "Your minion is busy, you can't do this.";

		if (cox?.start) {
			return coxCommand(
				channelID,
				user,
				cox.start.type,
				cox.start.max_team_size,
				Boolean(cox.start.challenge_mode),
				cox.start.quantity
			);
		}
		if (tob?.start) {
			return tobStartCommand(
				user,
				channelID,
				Boolean(tob.start.hard_mode),
				tob.start.max_team_size,
				Boolean(tob.start.solo),
				tob.start.quantity
			);
		}

		if (options.toa?.start) {
			return toaStartCommand(
				user,
				Boolean(options.toa.start.solo),
				channelID,
				options.toa.start.raid_level,
				options.toa.start.max_team_size,
				options.toa.start.quantity
			);
		}

		return 'Invalid command.';
	}
};
