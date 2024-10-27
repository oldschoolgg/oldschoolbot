import { Time } from 'e';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function troubleBrewingStartCommand(user: MUser, channelID: string) {
	const timePerGame = Time.Minute * 20;
	const maxTripLength = calcMaxTripLength(user, 'TroubleBrewing');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		quantity,
		userID: user.id,
		duration,
		type: 'TroubleBrewing',
		channelID: channelID.toString(),
		minigameID: 'trouble_brewing'
	});

	return `${user.minionName} is now doing ${quantity}x games of Trouble Brewing! It will take ${formatDuration(
		duration
	)} to finish.`;
}
