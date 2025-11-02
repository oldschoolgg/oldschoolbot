import { randomVariation } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';

import type { ActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function combatRingCommand(user: MUser, channelId: string) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}

	await ActivityManager.startTrip<ActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelId,
		duration: randomVariation(Time.Minute * 5, 5),
		type: 'CombatRing'
	});

	return `${user.minionName} is now fighting in the Shayzien Combat Ring!`;
}
