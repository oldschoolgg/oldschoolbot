import { Time } from 'e';

import { client } from '../..';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { OSBMahojiCommand } from '../lib/util';

export const easterCommand: OSBMahojiCommand = {
	name: 'easter',
	description: 'The 2022 Easter Event command!.',
	attributes: {
		requiresMinion: true,
		categoryFlags: ['minion'],
		description: 'Allows you to do the 2022 Easter Event.'
	},
	options: [],
	run: async ({ channelID, userID }) => {
		const user = await client.fetchUser(userID.toString());
		if (user.minionIsBusy) return `${user.minionName} is busy.`;

		if (user.cl().has('Bunnyman mask')) {
			return 'You already finished the Easter Event!';
		}

		await addSubTaskToActivityTask({
			userID: user.id,
			channelID: channelID.toString(),
			type: 'Easter',
			duration: Time.Minute * 15
		});

		return `${user.minionName} is now doing the 2022 Easter Event! The trip will take 15 minutes.`;
	}
};
