import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Planks } from '../../lib/minions/data/planks';
import { ButlerActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ButlerActivityTaskOptions) {
		const { userID, channelID, plankID, plankQuantity } = data;
		const user = await this.client.fetchUser(userID);
		const plank = Planks.find(plank => plank.outputItem === plankID)!;

		const loot = new Bank({
			[plankID]: plankQuantity
		});

		let str = `${user}, ${user.minionName} finished creating planks, you received ${loot}.`;

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { plank_make: { action: 'butler', quantity: plankQuantity, type: plank.name } }, true],
			undefined,
			data,
			loot
		);
	}
}
