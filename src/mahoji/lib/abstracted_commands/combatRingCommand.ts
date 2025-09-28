import { randomVariation, Time } from '@oldschoolgg/toolkit';

import type { ActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';

export async function combatRingCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}

	await addSubTaskToActivityTask<ActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: randomVariation(Time.Minute * 5, 5),
		type: 'CombatRing'
	});

	return `${user.minionName} is now fighting in the Shayzien Combat Ring!`;
}
