import { Time } from '@oldschoolgg/toolkit';
import { randomVariation } from 'node-rng';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

export async function stealingCreationCommand(user: MUser, channelId: string) {
	if (await user.minionIsBusy()) return 'Your minion is busy.';

	const gameTime = Time.Minute * 12.5;
	const quantity = Math.floor((await user.calcMaxTripLength('StealingCreation')) / gameTime);
	const duration = randomVariation(quantity * gameTime, 5);

	const str = `${
		user.minionName
	} is now off to do ${quantity} Stealing Creation games. The total trip will take ${formatTripDuration(user, duration)}.`;

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'StealingCreation',
		minigameID: 'stealing_creation'
	});

	return str;
}
