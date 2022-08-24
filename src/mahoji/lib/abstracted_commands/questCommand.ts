import { Time } from 'e';

import { MAX_QP } from '../../../lib/constants';
import { ActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { userHasGracefulEquipped } from '../../mahojiSettings';

export async function questCommand(user: MUser, channelID: bigint) {
	if (!user.user.minion_hasBought) {
		return 'You need a minion to do a questing trip';
	}
	if (minionIsBusy(user.id)) {
		return 'Your minion must not be busy to do a questing trip';
	}
	const currentQP = user.QP;
	if (currentQP >= MAX_QP) {
		return 'You already have the maximum amount of Quest Points.';
	}

	const boosts = [];

	let duration = Time.Minute * 30;

	if (userHasGracefulEquipped(user)) {
		duration *= 0.9;
		boosts.push('10% for Graceful');
	}

	await addSubTaskToActivityTask<ActivityTaskOptions>({
		type: 'Questing',
		duration,
		userID: user.id,
		channelID: channelID.toString()
	});
	let response = `${user.minionName} is now completing quests, they'll come back in around ${formatDuration(
		duration
	)}.`;

	if (boosts.length > 0) {
		response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return response;
}
