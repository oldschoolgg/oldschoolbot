import { formatDuration, randomVariation } from '@oldschoolgg/toolkit/util';
import { Time } from 'e';

import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function aerialFishingCommand(user: MUser, channelID: string) {
	if (user.skillsAsLevels.fishing < 43 || user.skillsAsLevels.hunter < 35) {
		return 'You need at least level 35 Hunter and 43 Fishing to do Aerial fishing.';
	}

	const timePerFish = randomVariation(2, 7.5) * Time.Second;
	const quantity = Math.floor(calcMaxTripLength(user, 'AerialFishing') / timePerFish);
	const duration = timePerFish * quantity;

	await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'AerialFishing'
	});

	return `${user.minionName} is now doing Aerial fishing, it will take around ${formatDuration(duration)} to finish.`;
}
