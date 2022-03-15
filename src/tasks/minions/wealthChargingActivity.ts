import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { wealthInventorySize } from '../../commands/Minion/chargewealth';
import { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { quantity, userID, channelID } = data;
		const user = await this.client.fetchUser(userID);
		let deaths = 0;
		let loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			if (roll(9)) {
				deaths++;
			} else {
				for (let i = 0; i < wealthInventorySize; i++) {
					loot.add('Ring of wealth(5)');
				}
			}
		}

		const amnt = loot.amount('Ring of wealth(5)');

		let str =
			loot.length === 0
				? `${user}, ${user.minionName} finished their ring of wealth charging trip, but died and lost all rings of wealth.`
				: `${user}, ${user.minionName} finished charging ${amnt} rings of wealth.`;

		if (loot.length !== 0 && deaths > 0) {
			str += ` They died ${deaths}x times, causing the loss of ${wealthInventorySize * deaths} rings of wealth.`;
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });
		handleTripFinish(this.client, user, channelID, str, ['chargewealth', [quantity], true], undefined, data, loot);
	}
}
