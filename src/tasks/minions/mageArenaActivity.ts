import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const mageArenaTask: MinionTask = {
	type: 'MageArena',
	async run(data: ActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelId } = data;

		const loot = new Bank().add('Saradomin cape').add('Zamorak cape').add('Guthix cape');
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		handleTripFinish(
			user,
			channelId,
			`${user}, ${user.minionName} finished the Mage Arena, you received: ${loot}.`,
			data,
			loot
		);
	}
};
