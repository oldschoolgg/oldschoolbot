import { Time } from 'e';

import { prisma } from '../settings/prisma';
import { MinigameActivityTaskOptionsWithNoChanges } from '../types/minions';
import { formatDuration, getInterval } from '../util';
import addSubTaskToActivityTask from '../util/addSubTaskToActivityTask';

const getGuthixianCacheInterval = () => getInterval(24);

export async function checkIfHasGuthixianCacheBoost(user: MUser) {
	const lastTrips = await prisma.activity.findMany({
		where: {
			user_id: BigInt(user.id),
			type: 'GuthixianCache',
			completed: true
		},
		orderBy: {
			finish_date: 'desc'
		},
		take: 1
	});
	const [lastTrip] = lastTrips;
	if (!lastTrip) return false;
	return Date.now() - lastTrip.finish_date.getTime() < Time.Hour * 3;
}

export async function joinGuthixianCache(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return `${user.minionName} is busy.`;
	}

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
	if (
		lastTrips.some(
			trip =>
				trip.finish_date.getTime() > currentInterval.start.getTime() &&
				trip.finish_date.getTime() < currentInterval.end.getTime()
		)
	) {
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

	let response = `${
		user.minionName
	} is now participating in the current Guthixian Cache, it'll take around ${formatDuration(
		task.duration
	)} to finish.`;

	return response;
}
