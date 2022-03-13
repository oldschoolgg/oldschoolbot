import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { diaries } from '../../lib/diaries';
import { ActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { minionStatsEmbed } from '../../lib/util/minionStatsEmbed';
import BankImageTask from '../../tasks/bankImage';
import {
	achievementDiaryCommand,
	claimAchievementDiaryCommand
} from '../lib/abstracted_commands/achievementDiaryCommand';
import { bankBgCommand } from '../lib/abstracted_commands/bankBgCommand';
import { crackerCommand } from '../lib/abstracted_commands/crackerCommand';
import { questCommand } from '../lib/abstracted_commands/questCommand';
import { OSBMahojiCommand } from '../lib/util';
import { MahojiUserOption } from '../mahojiSettings';

export const minionCommand: OSBMahojiCommand = {
	name: 'minion',
	description: 'Manage and control your minion.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cracker',
			description: 'Use a Christmas Cracker on someone.',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user you want to use the cracker on.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'birthdayevent',
			description: 'Send your minion to do the Birthday Event.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'stats',
			description: 'Check the stats of your minion.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'achievementdiary',
			description: 'Manage your achievement diary.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'diary',
					description: 'The achievement diary name.',
					required: false,
					choices: diaries.map(i => ({ name: i.name, value: i.name }))
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'claim',
					description: 'Claim your rewards?',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'bankbg',
			description: 'Change your bank background.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name of the bank background you want.',
					autocomplete: async value => {
						const bankImages = (client.tasks.get('bankImage') as BankImageTask).backgroundImages;
						return bankImages
							.filter(bg => (!value ? true : bg.available))
							.filter(bg => (!value ? true : bg.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => {
								const name = i.perkTierNeeded
									? `${i.name} (Tier ${i.perkTierNeeded - 1} patrons)`
									: i.name;
								return { name, value: i.name };
							});
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'quest',
			description: 'Send your minion to do quests.'
		}
	],
	run: async ({
		userID,
		options,
		channelID,
		interaction
	}: CommandRunOptions<{
		birthdayevent?: {};
		stats?: {};
		achievementdiary?: { diary?: string; claim?: boolean };
		bankbg?: { name?: string };
		cracker?: { user: MahojiUserOption };
		quest?: {};
	}>) => {
		const user = await client.fetchUser(userID.toString());

		if (options.birthdayevent) {
			await addSubTaskToActivityTask<ActivityTaskOptions>({
				userID: userID.toString(),
				channelID: channelID.toString(),
				duration: Time.Minute * 20,
				type: 'BirthdayEvent'
			});

			return `${user.minionName} is doing the 2022 OSRS Birthday Event! The trip will take around 20 minutes.`;
		}

		if (options.stats) {
			return { embeds: [await minionStatsEmbed(user)] };
		}

		if (options.achievementdiary) {
			if (options.achievementdiary.claim) {
				return claimAchievementDiaryCommand(user, options.achievementdiary.diary ?? '');
			}
			return achievementDiaryCommand(user, options.achievementdiary.diary ?? '');
		}

		if (options.bankbg) {
			return bankBgCommand(interaction, user, options.bankbg.name ?? '');
		}
		if (options.cracker) {
			const otherUser = await client.fetchUser(options.cracker.user.user.id);
			return crackerCommand({ owner: user, otherPerson: otherUser, interaction });
		}
		if (options.quest) {
			return questCommand(user, channelID);
		}

		return 'Unknown command';
	}
};
