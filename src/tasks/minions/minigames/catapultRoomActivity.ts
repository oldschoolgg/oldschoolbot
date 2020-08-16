import { Task } from 'klasa';

import { CatapultRoomActivityTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import { noOp } from '../../../lib/util';

export default class extends Task {
	async run({ userID, channelID, quantity, duration }: CatapultRoomActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);
		const str = `${user}, ${
			user.minionName
		} finished blocking ${quantity}x catapult shots and received ${Number(
			quantity
		)}x Warrior guild tokens.`;
		const loot = {
			8851: Number(quantity)
		};

		await user.addItemsToBank(loot, true);

		// TODO: 10 Defence xp per catapult shot (quantity)

		if (!channelIsSendable(channel)) return;

		return channel.send(str);
	}
}
