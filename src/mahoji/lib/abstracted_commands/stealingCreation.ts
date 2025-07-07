import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Time } from 'e';
import { randomVariation } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function stealingCreationCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) return 'Your minion is busy.';

	const gameTime = Time.Minute * 12.5;
	const quantity = Math.floor(calcMaxTripLength(user, 'StealingCreation') / gameTime);
	const duration = randomVariation(quantity * gameTime, 5);

	const str = `${
		user.minionName
	} is now off to do ${quantity} Stealing Creation games. The total trip will take ${formatDuration(duration)}.`;

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID,
		quantity,
		duration,
		type: 'StealingCreation',
		minigameID: 'stealing_creation'
	});

	return str;
}
