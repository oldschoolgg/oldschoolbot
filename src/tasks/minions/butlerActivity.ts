import { Bank } from 'oldschooljs';

import type { ButlerActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const butlerTask: MinionTask = {
	type: 'Butler',
	async run(data: ButlerActivityTaskOptions) {
		const { userID, channelID, plankID, plankQuantity } = data;
		const user = await mUserFetch(userID);

		const loot = new Bank({
			[plankID]: plankQuantity
		});

		const str = `${user}, ${user.minionName} finished creating planks, you received ${loot}.`;

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
