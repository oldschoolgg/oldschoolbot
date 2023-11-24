import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { hweenGiveableItems } from '../../lib/constants';
import { ActivityTaskData } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { formatDuration } from '../../lib/util/smallUtils';
import { OSBMahojiCommand } from '../lib/util';

export const halloweenCommand: OSBMahojiCommand = {
	name: 'halloween',
	description: 'The 2023 OSB Halloween Event!',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Do the event.'
		}
	],
	run: async ({
		userID,
		options,
		channelID
	}: CommandRunOptions<{
		start?: {};
	}>) => {
		const user = await mUserFetch(userID);
		if (options.start) {
			if (hweenGiveableItems.every(i => user.cl.has(i))) {
				return 'You have already completed the Halloween event!';
			}
			const duration = Time.Minute * 15;
			await addSubTaskToActivityTask<ActivityTaskData>({
				userID: user.id,
				channelID,
				duration,
				type: 'HalloweenEvent'
			});
			return `${user.minionName} is now doing the Halloween event! It'll take around ${formatDuration(
				duration
			)} to finish. Spooky!`;
		}
		return 'You can start the Halloween event by typing `/halloween start`.';
	}
};
