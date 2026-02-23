import { Time } from '@oldschoolgg/toolkit';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

export async function aerialFishingCommand({
	user,
	channelId,
	rng
}: {
	user: MUser;
	channelId: string;
	rng: RNGProvider;
}) {
	if (user.skillsAsLevels.fishing < 43 || user.skillsAsLevels.hunter < 35) {
		return 'You need at least level 35 Hunter and 43 Fishing to do Aerial fishing.';
	}

	const timePerFish = rng.randomVariation(2, 7.5) * Time.Second;
	const quantity = Math.floor((await user.calcMaxTripLength('AerialFishing')) / timePerFish);
	const duration = timePerFish * quantity;

	await ActivityManager.startTrip<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelId,
		quantity,
		duration,
		type: 'AerialFishing'
	});

	return `${user.minionName} is now doing Aerial fishing, it will take around ${await formatTripDuration(user, duration)} to finish.`;
}
