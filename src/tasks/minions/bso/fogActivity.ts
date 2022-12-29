import { Bank } from 'oldschooljs';

import { userHasFlappy } from '../../../lib/invention/inventions';
import { randomizeBank } from '../../../lib/randomizer';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const fogTask: MinionTask = {
	type: 'FistOfGuthix',
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		const { newScore } = await incrementMinigameScore(userID, 'fist_of_guthix', quantity);

		const user = await mUserFetch(userID);
		let loot = new Bank().add('Fist of guthix token', quantity * 15);
		loot = randomizeBank(user.id, loot);
		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) loot.multiply(2);

		await user.addItemsToBank({ items: loot, collectionLog: true });

		let str = `${user}, ${user.minionName} finished completing ${quantity}x Fist of Guthix games, you received ${loot}. You have now completed a total of ${newScore} games.`;

		if (flappyRes.userMsg) str += `\n${flappyRes.userMsg}`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
