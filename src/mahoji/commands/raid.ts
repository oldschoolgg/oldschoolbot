import { doaHelpCommand } from '@/lib/bso/depthsOfAtlantis.js';
import { doaStartCommand } from '@/lib/bso/doa/doaStartCommand.js';

import { choicesOf } from '@/discord/index.js';
import { toaHelpCommand, toaStartCommand } from '@/lib/simulation/toa.js';
import { mileStoneBaseDeathChances } from '@/lib/simulation/toaUtils.js';
import { coxCommand, coxStatsCommand } from '@/mahoji/lib/abstracted_commands/coxCommand.js';
import { tobCheckCommand, tobStartCommand, tobStatsCommand } from '@/mahoji/lib/abstracted_commands/tobCommand.js';

export const raidCommand = defineCommand({
	name: 'raid',
	description: 'Send your minion to do raids - CoX or ToB.',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: 'SubcommandGroup',
			name: 'cox',
			description: 'The Chambers of Xeric.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Chambers of Xeric trip',
					options: [
						{
							type: 'String',
							name: 'type',
							description: 'Choose whether you want to solo, mass, or fake mass.',
							choices: choicesOf(['solo', 'mass']),
							required: true
						},
						{
							type: 'Boolean',
							name: 'challenge_mode',
							description: 'Choose whether you want to do Challenge Mode.',
							required: false
						},
						{
							type: 'Integer',
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false,
							min_value: 1
						},
						{
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 10
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'stats',
					description: 'Check your CoX stats.'
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'tob',
			description: 'The Theatre of Blood.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Theatre of Blood trip',
					options: [
						{
							type: 'String',
							name: 'solo',
							description: 'Attempt the Theatre by yourself.',
							choices: choicesOf(['solo', 'trio'])
						},
						{
							type: 'Boolean',
							name: 'hard_mode',
							description: 'Choose whether you want to do Hard Mode.',
							required: false
						},
						{
							type: 'Integer',
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false,
							min_value: 1
						},
						{
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 30
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'stats',
					description: 'Check your ToB stats.'
				},
				{
					type: 'Subcommand',
					name: 'check',
					description: "Check if you're ready for ToB.",
					options: [
						{
							type: 'Boolean',
							name: 'hard_mode',
							description: 'Choose whether you want to check Hard Mode.',
							required: false
						}
					]
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'toa',
			description: 'The Tombs of Amascut.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Tombs of Amascut trip',
					options: [
						{
							type: 'Integer',
							name: 'raid_level',
							description: 'Choose the raid level you want to do (1-600).',
							required: true,
							choices: mileStoneBaseDeathChances.map(i => ({
								name: i.level.toString(),
								value: i.level
							}))
						},
						{
							type: 'Boolean',
							name: 'solo',
							description: 'Do you want to solo?',
							required: false
						},
						{
							type: 'Integer',
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false,
							min_value: 1,
							max_value: 8
						},
						{
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 5
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'help',
					description: 'Shows helpful information and stats about TOA.'
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'doa',
			description: 'The Depths of Atlantis.',
			options: [
				{
					type: 'Subcommand',
					name: 'start',
					description: 'Start a Depths of Atlantis trip',
					options: [
						{
							type: 'Boolean',
							name: 'challenge_mode',
							description: 'Try if you dare.',
							required: false
						},
						{
							type: 'Boolean',
							name: 'solo',
							description: 'Do you want to solo?',
							required: false
						},
						{
							type: 'Integer',
							name: 'max_team_size',
							description: 'Choose a max size for your team.',
							required: false,
							min_value: 1,
							max_value: 8
						},
						{
							type: 'Integer',
							name: 'quantity',
							description: 'The quantity to do.',
							required: false,
							min_value: 1,
							max_value: 5
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'help',
					description: 'Shows helpful information and stats about DOA.'
				}
			]
		}
	],
	run: async ({ interaction, options, user, channelId }) => {
		if (interaction) await interaction.defer();

		const { cox, tob } = options;
		if (cox?.stats) return coxStatsCommand(user);
		if (tob?.stats) return tobStatsCommand(user);
		if (tob?.check) return tobCheckCommand(user, Boolean(tob.check.hard_mode));
		if (options.toa?.help) return toaHelpCommand(user, channelId);
		if (options.doa?.help) {
			return doaHelpCommand(user);
		}

		if (await user.minionIsBusy()) return "Your minion is busy, you can't do this.";

		if (cox?.start) {
			return coxCommand(
				interaction,
				channelId,
				user,
				cox.start.type,
				cox.start.max_team_size,
				Boolean(cox.start.challenge_mode),
				cox.start.quantity
			);
		}
		if (tob?.start) {
			return tobStartCommand(
				interaction,
				user,
				channelId,
				Boolean(tob.start.hard_mode),
				tob.start.max_team_size,
				tob.start.solo,
				tob.start.quantity
			);
		}

		if (options.toa?.start) {
			return toaStartCommand(
				interaction,
				user,
				Boolean(options.toa.start.solo),
				channelId,
				options.toa.start.raid_level,
				options.toa.start.max_team_size,
				options.toa.start.quantity
			);
		}

		if (options.doa?.start) {
			return doaStartCommand(
				interaction,
				user,
				Boolean(options.doa.start.challenge_mode),
				Boolean(options.doa.start.solo),
				channelId,
				options.doa.start.max_team_size,
				options.doa.start.quantity
			);
		}

		return 'Invalid command.';
	}
});
