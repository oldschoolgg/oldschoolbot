import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const brewingTask: MinionTask = {
	type: 'TroubleBrewing',
	isNew: true,
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID, quantity } = data;
		await user.incrementMinigameScore('trouble_brewing', quantity);
		const loot = new Bank().add('Pieces of eight', quantity * 100);

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const str = `${user}, ${user.minionName} finished doing ${quantity}x games of Trouble Brewing, you received: ${loot}.`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
