import { formatDuration, Time } from '@oldschoolgg/toolkit';

import removeFoodFromUser from '@/lib/minions/functions/removeFoodFromUser.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';

export async function myNotesCommand(user: MUser, channelID: string) {
	if (await user.minionIsBusy()) {
		return 'Your minion is busy.';
	}
	const oneSkeleton = 5 * Time.Second;
	const maxTripLength = user.calcMaxTripLength('MyNotes');
	const quantity = Math.floor(maxTripLength / oneSkeleton);
	const duration = quantity * oneSkeleton;

	const { foodRemoved } = await removeFoodFromUser({
		user,
		totalHealingNeeded: 5 * quantity,
		healPerAction: 6,
		activityName: 'MyNotes',
		attackStylesUsed: []
	});

	await ActivityManager.startTrip<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID,
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
