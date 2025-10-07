import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const brewingTask: MinionTask = {
	type: 'TroubleBrewing',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID, quantity, duration } = data;
		await user.incrementMinigameScore('trouble_brewing', quantity);
		const loot = new Bank().add('Pieces of eight', quantity * 100);

		const flappyRes = await user.hasFlappy(duration);
		if (flappyRes.shouldGiveBoost) loot.multiply(2);

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		let str = `${user}, ${user.minionName} finished doing ${quantity}x games of Trouble Brewing, you received: ${loot}.`;
		if (flappyRes.userMsg) str += `\n${flappyRes.userMsg}`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
