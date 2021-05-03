import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { gloriesInventorySize } from '../../commands/Minion/chargeglories';
import { GloryChargingActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: GloryChargingActivityTaskOptions) {
		const { quantity, userID, channelID } = data;
		const user = await this.client.users.fetch(userID);
		let deaths = 0;
		let loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			if (roll(9)) {
				deaths++;
			} else {
				for (let i = 0; i < gloriesInventorySize; i++) {
					if (roll(25_000)) {
						loot.add('Amulet of eternal glory');
					} else {
						loot.add('Amulet of glory(6)');
					}
				}
			}
		}

		const amnt = loot.amount('Amulet of glory(6)');

		let str =
			loot.length === 0
				? `${user}, ${user.minionName} finished their glory charging trip, but died and lost all glories.`
				: `${user}, ${user.minionName} finished charging ${amnt} Amulets of glory.`;

		if (loot.length !== 0 && deaths > 0) {
			str += ` They died ${deaths}x times, causing the loss of ${
				gloriesInventorySize * deaths
			} glories.`;
		}

		if (loot.has('Amulet of eternal glory')) {
			str += `\n**Your minion received an Amulet of eternal glory.**`;
		}

		await user.addItemsToBank(loot.bank, true);
		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of charging ${quantity}x glories`);
				return this.client.commands.get('chargeglories')!.run(res, [quantity]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
