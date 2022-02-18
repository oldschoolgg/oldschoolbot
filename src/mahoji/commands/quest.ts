import { Time } from 'e';
import { CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { MAX_QP } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { QuestingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { OSBMahojiCommand } from '../lib/util';

export const questCommand: OSBMahojiCommand = {
	name: 'quest',
	description: 'Sends your minion to complete quests.',
	attributes: {
		categoryFlags: ['minion'],
		description: 'Sends your minion to complete quests.'
	},
	options: [],
	run: async ({ channelID, userID }: CommandRunOptions) => {
		const user = await client.fetchUser(userID.toString());
		const currentQP = user.settings.get(UserSettings.QP);

		if (currentQP >= MAX_QP) {
			return 'You already have the maximum amount of Quest Points.';
		}

		const boosts = [];

		let duration = Time.Minute * 30;

		if (user.hasGracefulEquipped()) {
			duration *= 0.9;
			boosts.push('10% for Graceful');
		}

		await addSubTaskToActivityTask<QuestingActivityTaskOptions>({
			type: 'Questing',
			duration,
			userID: user.id,
			channelID: channelID.toString()
		});

		let response = `${user.minionName} is now completing quests, they'll come back in around ${formatDuration(
			duration
		)}.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
