import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';

export const gloryUnchargingTask: MinionTask = {
	type: 'GloryUncharging',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { quantity, channelId } = data;
		const loot = new Bank().add('Amulet of glory', quantity);
		const str = `${user}, ${user.minionName} finished uncharging ${quantity}x Amulet of glory(6).`;

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
