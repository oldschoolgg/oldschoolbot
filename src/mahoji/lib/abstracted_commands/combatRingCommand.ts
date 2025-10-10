import { randomVariation } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';

import type { ActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function combatRingCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}

	await ActivityManager.startTrip<ActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID,
		duration: randomVariation(Time.Minute * 5, 5),
		type: 'CombatRing'
	});

	return `${user.minionName} is now fighting in the Shayzien Combat Ring!`;
}
