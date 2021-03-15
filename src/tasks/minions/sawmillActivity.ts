import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Planks } from '../../lib/minions/data/planks';
import { SawmillActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: SawmillActivityTaskOptions) {
		const { userID, channelID, duration, plankID, plankQuantity } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const plank = Planks.find(plank => plank.outputItem === plankID)!;

		const loot = new Bank({
			[plankID]: plankQuantity
		});

		let str = `${user}, ${user.minionName} finished creating planks, you received ${loot}.`;
		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${plankQuantity}x ${plank.name}`);
				return this.client.commands.get('sawmill')!.run(res, [plankQuantity, plank.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
