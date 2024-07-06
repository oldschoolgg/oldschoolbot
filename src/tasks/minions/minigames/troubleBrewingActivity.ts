import { Bank } from 'oldschooljs';

import { userHasFlappy } from '../../../lib/invention/inventions';
import { incrementMinigameScore } from '../../../lib/settings/minigames';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const brewingTask: MinionTask = {
	type: 'TroubleBrewing',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, userID, duration } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(user.id, 'trouble_brewing', quantity);
		const loot = new Bank().add('Pieces of eight', quantity * 100);

		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) loot.multiply(2);

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

<<<<<<< HEAD
		const str = `${user}, ${user.minionName} finished doing ${quantity}x games of Trouble Brewing, you received: ${loot}.`;
		if (flappyRes.userMsg) str += `\n${flappyRes.userMsg}`;
=======
		const str = `${user}, ${user.minionName} finished doing ${quantity}x games of Trouble Brewing, you received: ${loot}.`;
>>>>>>> master

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
