import { Time } from 'e';
import { KlasaUser } from 'klasa';

import { MAX_QP } from '../../../lib/constants';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { ActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';

export async function questCommand(user: KlasaUser, channelID: bigint) {
	if (!user.hasMinion) {
		return 'You need a minion to do a questing trip';
	}
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to do a questing trip';
	}
	const currentQP = user.settings.get(UserSettings.QP);
	if (currentQP >= MAX_QP) {
		return 'You already have the maximum amount of Quest Points.';
	}

	const boosts = [];

	let duration = Time.Minute * 30;

	if (user.hasGracefulEquipped()) {
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
