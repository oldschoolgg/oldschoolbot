import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { ActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ActivityTaskOptions) {
		const { userID, channelID } = data;
		const user = await this.client.fetchUser(userID);
		const items = new Bank()
			.add('Slice of birthday cake')
			.add('Banana hat')
			.add('Prop sword')
			.add('Birthday balloons')
			.remove(user.allItemsOwned());

		if (items.length > 0) {
			await user.addItemsToBank({ items, collectionLog: true });
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished doing the Birthday Event and received: ${items}.`,
			undefined,
			undefined,
			data,
			null
		);
	}
}
