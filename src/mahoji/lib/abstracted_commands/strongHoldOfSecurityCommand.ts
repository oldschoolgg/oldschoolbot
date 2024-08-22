import { Time } from 'e';

import type { ActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function strongHoldOfSecurityCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const count = await prisma.activity.count({
		where: {
			user_id: BigInt(user.id),
			type: 'StrongholdOfSecurity'
		}
	});
	if (count !== 0) {
		return "You've already completed the Stronghold of Security!";
	}

	await addSubTaskToActivityTask<ActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: randomVariation(Time.Minute * 10, 5),
		type: 'StrongholdOfSecurity'
	});

	return `${user.minionName} is now doing the Stronghold of Security!`;
}
