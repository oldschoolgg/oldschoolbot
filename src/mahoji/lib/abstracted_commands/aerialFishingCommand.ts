import { randomVariation } from '@oldschoolgg/rng';
import { formatDuration, Time } from '@oldschoolgg/toolkit';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';

export async function aerialFishingCommand(user: MUser, channelID: string) {
	if (user.skillsAsLevels.fishing < 43 || user.skillsAsLevels.hunter < 35) {
		return 'You need at least level 35 Hunter and 43 Fishing to do Aerial fishing.';
	}

	const timePerFish = randomVariation(2, 7.5) * Time.Second;
	const quantity = Math.floor((await user.calcMaxTripLength('AerialFishing')) / timePerFish);
	const duration = timePerFish * quantity;

	await ActivityManager.startTrip<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID,
		quantity,
		duration,
		type: 'AerialFishing'
	});

	return `${user.minionName} is now doing Aerial fishing, it will take around ${formatDuration(duration)} to finish.`;
}
