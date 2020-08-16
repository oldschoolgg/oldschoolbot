import { Task } from 'klasa';

import { DummyRoomActivityTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import { noOp } from '../../../lib/util';


export default class extends Task {
	async run({userID, channelID, quantity, duration }: DummyRoomActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);
		const str = `You finished whacking ${quantity}x dummies and recieved ${quantity * 2}x Warrior guild token.`;
		const loot = {
			[8851]: quantity * 2
		};

		await user.addItemsToBank(loot, true);
		
		//TODO: 15 Attack xp per dummy (quantity)

		if (!channelIsSendable(channel)) return;

		return channel.send(str);
	}
}
