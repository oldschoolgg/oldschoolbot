import { Bank } from 'oldschooljs';

import { ActivityTaskOptionsWithNoChanges } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const mageArenaTask: MinionTask = {
	type: 'MageArena',
	async run(data: ActivityTaskOptionsWithNoChanges) {
		let { userID, channelID } = data;
		const user = await mUserFetch(userID);
		const loot = new Bank().add('Saradomin cape').add('Zamorak cape').add('Guthix cape');
		await transactItems({
			userID: user.id,
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
