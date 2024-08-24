import { Time } from 'e';

import type { ActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

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
