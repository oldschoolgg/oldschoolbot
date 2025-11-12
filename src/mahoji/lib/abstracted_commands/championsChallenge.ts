import { randomVariation } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, ItemGroups } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function championsChallengeCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}

	const { bank } = user;
	if (!bank.has(ItemGroups.championScrolls)) {
		return "You don't have a set of Champion Scrolls to do the Champion's Challenge! You need 1 of each.";
	}

	const cost = new Bank();
	for (const id of ItemGroups.championScrolls) cost.add(id);
	await user.transactItems({ itemsToRemove: cost });

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID,
		quantity: 1,
		duration: randomVariation(Time.Minute * 20, 5),
		type: 'ChampionsChallenge',
		minigameID: 'champions_challenge'
	});

	return `${user.minionName} is now doing the Champion's Challenge! Removed 1x of every Champion scroll from your bank.`;
}
