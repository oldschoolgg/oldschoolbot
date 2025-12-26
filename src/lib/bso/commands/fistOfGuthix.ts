import { randomVariation } from '@oldschoolgg/rng';
import { formatDuration, Time } from '@oldschoolgg/toolkit';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function fistOfGuthixCommand(user: MUser, channelId: string) {
	if (await user.minionIsBusy()) return 'Your minion is busy.';

	const gameTime = Time.Minute * 7.5;
	const quantity = Math.floor((await user.calcMaxTripLength('FistOfGuthix')) / gameTime);
	const duration = randomVariation(quantity * gameTime, 5);

	const str = `${
		user.minionName
	} is now off to do ${quantity} Fist of Guthix games. The total trip will take ${formatDuration(duration)}.`;

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'FistOfGuthix',
		minigameID: 'fist_of_guthix'
	});

	return str;
}
