import { roll } from 'e';
import { Bank } from 'oldschooljs';

import { ActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { everyEasterReward } from '../../mahoji/commands/easter';

export const easterTask: MinionTask = {
	type: 'Easter',
	async run(data: ActivityTaskOptions) {
		const { userID, channelID } = data;
		const user = await mUserFetch(userID);

		const itemsNotOwned = everyEasterReward
			.clone()
			.remove(user.isIronman ? user.allItemsOwned : user.cl)
			.items()
			.map(i => i[0]);
		const loot = new Bank();
		for (let i = 0; i < 15; i++) {
			loot.add(itemsNotOwned[i]);
		}
		if (roll(5)) loot.add('Easter egg');

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		return handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished doing the Easter Event, you received ${loot}`,
			undefined,
			data,
			loot
		);
	}
};
