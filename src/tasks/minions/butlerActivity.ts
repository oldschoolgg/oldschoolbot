import { Bank } from 'oldschooljs';

import type { ButlerActivityTaskOptions } from '@/lib/types/minions.js';

export const butlerTask: MinionTask = {
	type: 'Butler',
	async run(data: ButlerActivityTaskOptions, { user, handleTripFinish }) {
		const { channelID, plankID, plankQuantity } = data;

		const itemsToAdd = new Bank().add(plankID, plankQuantity);

		const str = `${user}, ${user.minionName} finished creating planks, you received ${itemsToAdd}.`;

		await user.transactItems({ itemsToAdd, collectionLog: true });

		handleTripFinish(user, channelID, str, undefined, data, itemsToAdd);
	}
};
