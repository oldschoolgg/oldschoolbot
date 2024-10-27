import { formatDuration, getInterval } from '@oldschoolgg/toolkit';
import { Time } from 'e';

import type { MinigameActivityTaskOptionsWithNoChanges } from '../types/minions';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';

export const getGuthixianCacheInterval = () => getInterval(24);

export async function userHasDoneCurrentGuthixianCache(user: MUser) {
	const currentInterval = getGuthixianCacheInterval();

	const lastTrips = await prisma.activity.findMany({
		where: {
			user_id: BigInt(user.id),
			type: 'GuthixianCache'
		},
		orderBy: {
			finish_date: 'desc'
		},
		take: 10
	});
	return lastTrips.some(
		trip =>
			trip.finish_date.getTime() > currentInterval.start.getTime() &&
			trip.finish_date.getTime() < currentInterval.end.getTime()
	);
}

export async function joinGuthixianCache(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return `${user.minionName} is busy.`;
	}

	const currentInterval = getGuthixianCacheInterval();

	if (await userHasDoneCurrentGuthixianCache(user)) {
		return `You already participated in the current Guthixian Cache, try again at: ${currentInterval.nextResetStr}`;
	}

	const task = await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID,
		quantity: 1,
		duration: Time.Minute * 10,
		type: 'GuthixianCache',
		minigameID: 'guthixian_cache'
	});

	const response = `${
		user.minionName
	} is now participating in the current Guthixian Cache, it'll take around ${formatDuration(
		task.duration
	)} to finish.`;

	return response;
}
