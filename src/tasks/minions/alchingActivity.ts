import { Task } from 'klasa';

import { AlchingActivityTaskOptions } from "../../lib/types/minions";
import { UserSettings } from '../../lib/UserSettings';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { toKMB } from 'oldschooljs/dist/util/util';

export default class extends Task{
	async run({itemName, totalValue, quantity, channelID, userID}: AlchingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);

		await user.settings.update(
			UserSettings.GP,
			user.settings.get(UserSettings.GP) + totalValue
		);
		
		const channel = this.client.channels.get(channelID);
		if(!channelIsSendable(channel)) return;
		
		const str = `${user}, ${user.minionName} has finished alching ${quantity}x ${itemName}! ${totalValue.toLocaleString()}gp (${toKMB(
			totalValue
		)}) has been added to your bank.`;

		this.client.queuePromise(() => {
			channel.send(str);
		})
	}
}