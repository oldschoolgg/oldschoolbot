import { randInt } from 'e';
import { Bank } from 'oldschooljs';

import { ActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const birthdayCollectTask: MinionTask = {
	type: 'BirthdayCollectIngredients',
	async run(data: ActivityTaskOptions) {
		const { channelID, userID } = data;

		const user = await mUserFetch(userID);
		const loot = new Bank();

		loot.add('Egg', randInt(1, 4));
		loot.add('Bucket of milk', randInt(1, 4));
		loot.add('Pot of flour', randInt(1, 4));

		loot.add('Perfect egg', randInt(1, 2));
		loot.add('Perfect bucket of milk', randInt(1, 2));
		loot.add('Perfect pot of flour', randInt(1, 2));

		await user.addItemsToBank({ items: loot, collectionLog: true });

		let str = `${user}, ${user.minionName} finished collecting a perfect set of cake ingredients! You received ${loot}.`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
