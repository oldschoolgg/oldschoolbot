import { Bank } from 'oldschooljs';

import { hweenGiveableItems } from '../../lib/constants';
import { ActivityTaskData } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const halloweenTask: MinionTask = {
	type: 'HalloweenEvent',
	async run(data: ActivityTaskData) {
		const { userID, channelID } = data;
		const user = await mUserFetch(userID);

		const loot = new Bank();

		for (const item of hweenGiveableItems) {
			if (!user.cl.has(item)) {
				loot.add(item);
			}
		}

		let str = `${user}, ${user.minionName} finished the Halloween event, you received: ${loot}.`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
