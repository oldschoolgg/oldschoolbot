import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { wealthInventorySize } from '@/mahoji/lib/abstracted_commands/chargeWealthCommand.js';

export const wealthChargeTask: MinionTask = {
	type: 'WealthCharging',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish, rng }) {
		const { quantity, channelId } = data;
		let deaths = 0;
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			if (rng.roll(9)) {
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

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
