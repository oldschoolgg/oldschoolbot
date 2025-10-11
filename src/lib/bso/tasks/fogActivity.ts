import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const fogTask: MinionTask = {
	type: 'FistOfGuthix',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID, quantity, duration } = data;

		const { newScore } = await user.incrementMinigameScore('fist_of_guthix', quantity);

		const loot = new Bank().add('Fist of guthix token', quantity * 15);

		const flappyRes = await user.hasFlappy(duration);
		if (flappyRes.shouldGiveBoost) loot.multiply(2);

		await user.addItemsToBank({ items: loot, collectionLog: true });

		let str = `${user}, ${user.minionName} finished completing ${quantity}x Fist of Guthix games, you received ${loot}. You have now completed a total of ${newScore} games.`;

		if (flappyRes.userMsg) str += `\n${flappyRes.userMsg}`;

		await user.addToGodFavour(['Guthix'], data.duration);

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
