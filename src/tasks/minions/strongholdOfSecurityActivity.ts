import { Bank } from 'oldschooljs';

import { ActivityTaskOptionsWithNoChanges } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const strongholdTask: MinionTask = {
	type: 'StrongholdOfSecurity',
	async run(data: ActivityTaskOptionsWithNoChanges) {
		const { channelID, userID } = data;
		const user = await mUserFetch(userID);

		const loot = new Bank().add('Coins', 10_000).add('Fancy boots').add('Fighting boots');

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished the Stronghold of Security, and received ${loot}.`,
			undefined,
			data,
			loot
		);
	}
};
