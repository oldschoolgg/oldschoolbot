import { Time } from 'e';

import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function guardiansOfTheRiftStartCommand(user: MUser, channelID: string) {
	let timePerGame = Time.Minute * 20;
	let maxTripLength = calcMaxTripLength(user, 'GuardiansOfTheRift');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
		quantity,
		userID: user.id,
		duration,
		type: 'GuardiansOfTheRift',
		channelID: channelID.toString(),
		minigameID: 'guardians_of_the_rift'
	});

	return `${user.minionName} is now doing ${quantity}x games of Guardians Of The Rift! It will take ${formatDuration(
		duration
	)} to finish.`;
}
