import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const scTask: MinionTask = {
	type: 'StealingCreation',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID, quantity, duration } = data;

		const { newScore } = await user.incrementMinigameScore('stealing_creation', quantity);

		const loot = new Bank().add('Stealing creation token', quantity * 5);

		const flappyRes = await user.hasFlappy(duration);
		if (flappyRes.shouldGiveBoost) loot.multiply(2);

		await user.addItemsToBank({ items: loot, collectionLog: true });

		let str = `${user}, ${user.minionName} finished completing ${quantity}x Stealing Creation games, you received ${loot}. You have now completed a total of ${newScore} games.`;

		if (flappyRes.userMsg) str += `\n${flappyRes.userMsg}`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
