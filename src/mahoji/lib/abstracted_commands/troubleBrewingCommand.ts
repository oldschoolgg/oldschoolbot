import { Time } from 'e';

import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function troubleBrewingStartCommand(user: MUser, channelID: string) {
	let timePerGame = Time.Minute * 20;
	let maxTripLength = calcMaxTripLength(user, 'TroubleBrewing');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
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
