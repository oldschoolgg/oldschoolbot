import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { wealthInventorySize } from '../../mahoji/lib/abstracted_commands/chargeWealthCommand';

export const wealthChargeTask: MinionTask = {
	type: 'WealthCharging',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { quantity, userID, channelID } = data;
		const user = await mUserFetch(userID);
		let deaths = 0;
		const loot = new Bank();
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

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
