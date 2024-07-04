import { Bank } from 'oldschooljs';

import { incrementMinigameScore } from '../../../lib/settings/minigames';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const brewingTask: MinionTask = {
	type: 'TroubleBrewing',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(user.id, 'trouble_brewing', quantity);
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
