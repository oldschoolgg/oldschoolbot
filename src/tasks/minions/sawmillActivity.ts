import { Task } from 'klasa';

import { Planks } from '../../lib/minions/data/planks';
import { SawmillActivityTaskOptions } from '../../lib/types/minions';
import { itemNameFromID } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: SawmillActivityTaskOptions) {
		const { userID, channelID, duration, plankID, plankQuantity } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const plank = Planks.find(plank => plank.outputItem === plankID);
		if (!plank) return;
		let str = `${user}, ${
			user.minionName
		} finished creating planks, you received ${plankQuantity}x ${itemNameFromID(plankID)}s. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		const loot = {
			[plankID]: plankQuantity
		};

		await user.addItemsToBank(loot, true);
		str += `\n\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${plankQuantity}x ${plank.name}`);
				return this.client.commands.get('sawmill')!.run(res, [plankQuantity, plank.name]);
			},
			data
		);
	}
}
