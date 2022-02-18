import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { ActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { minionStatsEmbed } from '../../lib/util/minionStatsEmbed';
import { OSBMahojiCommand } from '../lib/util';

export const minionCommand: OSBMahojiCommand = {
	name: 'minion',
	description: 'Manage and control your minion.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'birthdayevent',
			description: 'Send your minion to do the Birthday Event.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'stats',
			description: 'Check the stats of your minion.'
		}
	],
	run: async ({ userID, options, channelID }: CommandRunOptions<{ birthdayevent?: {}; stats?: {} }>) => {
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

		return 'Unknown command';
	}
};
