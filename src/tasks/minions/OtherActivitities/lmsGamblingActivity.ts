import { Task } from 'klasa';

import { channelsPlayingLms } from '../../../commands/OSRS_Fun/LastManStanding';
import { LmsGamblingActivityTaskOptions } from '../../../lib/types/minions';
import { sendToChannelID } from '../../../lib/util/webhook';

export default class extends Task {
	async run(data: LmsGamblingActivityTaskOptions) {
		const user = await this.client.fetchUser(data.winner);
		await user.addGP(data.prize);
		await sendToChannelID(this.client, data.channelID, {
			content: `The winner is **${user}**! Congratulations! You won${
				data.prize > 0 ? `**${data.prize.toLocaleString()}** GP` : ''
			}!`
		});
		channelsPlayingLms.add(data.channelID);
	}
}
