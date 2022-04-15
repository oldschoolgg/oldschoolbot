import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { ActivityTaskOptions } from '../../lib/types/minions';
import { sendToChannelID } from '../../lib/util/webhook';

export default class extends Task {
	async run(data: ActivityTaskOptions) {
		const { channelID, userID } = data;
		const user = await this.client.fetchUser(userID);

		const loot = new Bank()
			.add('Giant easter egg')
			.add('Bunnyman mask')
			.add('Carrot sword')
			.add("'24-carat' sword");

		await user.addItemsToBank({ items: loot, collectionLog: true });

		sendToChannelID(this.client, channelID, {
			content: `${user}, ${user.minionName} finished the Easter Event! You received ${loot}.`
		});
	}
}
