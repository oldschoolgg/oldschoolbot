import { Bank } from 'oldschooljs';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const championsChallengeTask: MinionTask = {
	type: 'ChampionsChallenge',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, userID } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(userID, 'champions_challenge', 1);

		const loot = new Bank({ "Champion's cape": 1 });

		await transactItems({
			userID: user.id,
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
