import { Bank } from 'oldschooljs';

import { userHasFlappy } from '../../../lib/invention/inventions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const fogTask: MinionTask = {
	type: 'FistOfGuthix',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, duration, userID } = data;

		const { newScore } = await incrementMinigameScore(userID, 'fist_of_guthix', quantity);

		const user = await mUserFetch(userID);
		const loot = new Bank().add('Fist of guthix token', quantity * 15);

		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) loot.multiply(2);

		await user.addItemsToBank({ items: loot, collectionLog: true });

		let str = `${user}, ${user.minionName} finished completing ${quantity}x Fist of Guthix games, you received ${loot}. You have now completed a total of ${newScore} games.`;

		if (flappyRes.userMsg) str += `\n${flappyRes.userMsg}`;

		await user.addToGodFavour(['Guthix'], data.duration);

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
