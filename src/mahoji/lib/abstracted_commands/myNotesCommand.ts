import { formatDuration, Time } from '@oldschoolgg/toolkit';

import removeFoodFromUser from '@/lib/minions/functions/removeFoodFromUser.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';

export async function myNotesCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const oneSkeleton = 5 * Time.Second;
	const maxTripLength = calcMaxTripLength(user, 'MyNotes');
	const quantity = Math.floor(maxTripLength / oneSkeleton);
	const duration = quantity * oneSkeleton;

	const { foodRemoved } = await removeFoodFromUser({
		user,
		totalHealingNeeded: 5 * quantity,
		healPerAction: 6,
		activityName: 'MyNotes',
		attackStylesUsed: []
	});

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'MyNotes',
		quantity
	});

	return `${
		user.minionName
	} is now rummaging ${quantity} skeletons for Ancient pages, it'll take around ${formatDuration(
		duration
	)} to finish. Removed ${foodRemoved}.`;
}
