import { Time } from 'e';

import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { formatDuration, randomVariation } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function aerialFishingCommand(user: MUser, channelID: string) {
	if (user.skillLevel(SkillsEnum.Fishing) < 43 || user.skillLevel(SkillsEnum.Hunter) < 35) {
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
