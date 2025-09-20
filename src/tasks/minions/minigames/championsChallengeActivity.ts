import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

export const championsChallengeTask: MinionTask = {
	type: 'ChampionsChallenge',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, userID } = data;
		const user = await mUserFetch(userID);
		await user.incrementMinigameScore('champions_challenge', 1);

		const loot = new Bank({ "Champion's cape": 1 });

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} completed the Champion's Challenge! You have received the **Champion's cape**.`,
			undefined,
			data,
			loot
		);
	}
};
