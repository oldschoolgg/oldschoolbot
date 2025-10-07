import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const mageArenaTask: MinionTask = {
	type: 'MageArena',
	async run(data: ActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID } = data;

		const loot = new Bank().add('Saradomin cape').add('Zamorak cape').add('Guthix cape');
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});
		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished the Mage Arena, you received: ${loot}.`,
			undefined,
			data,
			loot
		);
	}
};
