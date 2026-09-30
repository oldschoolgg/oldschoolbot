import { dateFm } from '@oldschoolgg/discord';
import { formatDuration, getNextUTCReset, Time } from '@oldschoolgg/toolkit';

import { CONSTANTS } from '@/lib/constants.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function joinGuthixianCache(user: MUser, channelId: string) {
	if (await user.minionIsBusy()) return `${user.minionName} is busy.`;

	const currentStats = await user.fetchStats();
	const lastPlayedDate = Number(currentStats.last_guthixian_cache_timestamp);
	const nextReset = getNextUTCReset(lastPlayedDate, CONSTANTS.GUTHIX_CACHE_CD);

	if (Date.now() < nextReset) {
		return `You already participated in the current Guthixian Cache, try again at: ${dateFm(new Date(nextReset))}`;
	}

	const task = await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelId,
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
