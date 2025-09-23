import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Time } from 'e';
import { randomVariation } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';

export async function fistOfGuthixCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) return 'Your minion is busy.';

	const gameTime = Time.Minute * 7.5;
	const quantity = Math.floor(calcMaxTripLength(user, 'FistOfGuthix') / gameTime);
	const duration = randomVariation(quantity * gameTime, 5);

	const str = `${
		user.minionName
	} is now off to do ${quantity} Fist of Guthix games. The total trip will take ${formatDuration(duration)}.`;

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID,
		quantity,
		duration,
		type: 'FistOfGuthix',
		minigameID: 'fist_of_guthix'
	});

	return str;
}
