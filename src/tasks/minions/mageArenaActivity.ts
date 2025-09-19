import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

export const mageArenaTask: MinionTask = {
	type: 'MageArena',
	async run(data: ActivityTaskOptionsWithNoChanges) {
		const { userID, channelID } = data;
		const user = await mUserFetch(userID);
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
