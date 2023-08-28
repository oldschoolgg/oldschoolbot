import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { championScrolls } from '../../../lib/data/CollectionsExport';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function championsChallengeCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}

	const { bank } = user;
	if (!bank.has(championScrolls)) {
		return "You don't have a set of Champion Scrolls to do the Champion's Challenge! You need 1 of each.";
	}

	const cost = new Bank();
	for (const id of championScrolls) cost.add(id);
	await transactItems({ userID: user.id, itemsToRemove: cost });

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity: 1,
		duration: randomVariation(Time.Minute * 20, 5),
		type: 'ChampionsChallenge',
		minigameID: 'champions_challenge'
	});

	return `${user.minionName} is now doing the Champion's Challenge! Removed 1x of every Champion scroll from your bank.`;
}
