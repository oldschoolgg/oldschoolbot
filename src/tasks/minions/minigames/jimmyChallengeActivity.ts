import { Task } from 'klasa';

import { JimmyChallengeActivityTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import { noOp } from '../../../lib/util';

export default class extends Task {
	async run({userID, channelID, quantity, duration }: JimmyChallengeActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);
		const str = `You finished balancing ${quantity}x kegs on your head and recieved ${quantity * 2}x Warrior guild tokens.`;
		const loot = {
			[8851]: quantity * 2
		};

		await user.addItemsToBank(loot, true);

		if (!channelIsSendable(channel)) return;

		return channel.send(str);
	}
}
