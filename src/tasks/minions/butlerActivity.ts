import { Bank } from 'oldschooljs';

import type { ButlerActivityTaskOptions } from '@/lib/types/minions.js';

export const butlerTask: MinionTask = {
	type: 'Butler',
	async run(data: ButlerActivityTaskOptions, { user, handleTripFinish }) {
		const { channelID, plankID, plankQuantity } = data;

		const loot = new Bank({
			[plankID]: plankQuantity
		});

		const str = `${user}, ${user.minionName} finished creating planks, you received ${loot}.`;

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
