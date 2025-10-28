import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const championsChallengeTask: MinionTask = {
	type: 'ChampionsChallenge',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		await user.incrementMinigameScore('champions_challenge', 1);

		const loot = new Bank().add("Champion's cape");

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			data.channelID,
			`${user}, ${user.minionName} completed the Champion's Challenge! You have received the **Champion's cape**.`,
			undefined,
			data,
			loot
		);
	}
};
