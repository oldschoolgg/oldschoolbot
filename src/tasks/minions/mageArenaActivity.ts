import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { ActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ActivityTaskOptions) {
		let { userID, channelID } = data;
		const user = await this.client.users.fetch(userID);
		const loot = new Bank().add('Saradomin cape').add('Zamorak cape').add('Guthix cape');
		await user.addItemsToBank(loot, true);
		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished the Mage Arena, you received: ${loot}.`,
			undefined,
			undefined,
			data,
			loot.bank
		);
	}
}
