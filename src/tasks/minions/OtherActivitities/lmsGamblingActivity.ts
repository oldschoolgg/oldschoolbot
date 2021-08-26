import { Task } from 'klasa';

import { channelsPlayingLms } from '../../../lib/constants';
import { LmsGamblingActivityTaskOptions } from '../../../lib/types/minions';
import { sendToChannelID } from '../../../lib/util/webhook';

export default class extends Task {
	async run(data: LmsGamblingActivityTaskOptions) {
		const user = await this.client.fetchUser(data.winner);
		if (data.prize > 0) await user.addGP(data.prize);
		await sendToChannelID(this.client, data.channelID, {
			content: `And the Last Man Standing is... **${user}**! Congratulations! You won${
				data.prize > 0 ? ` **${data.prize.toLocaleString()}** GP` : ''
			}!`
		});
		channelsPlayingLms.delete(data.channelID);
	}
}
