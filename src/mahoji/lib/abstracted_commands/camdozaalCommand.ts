import { CamdozaalOptions, CamdozaalType } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { formatDuration } from '../../../lib/util/smallUtils';

export async function camdozaalMineCommand(user: MUser, channelID: string) {
	const duration = calcMaxTripLength(user, 'Camdozaal');
	await addSubTaskToActivityTask<CamdozaalOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'Camdozaal',
		ctype: CamdozaalType.Mine
	});

	let str = `${user.minionName} is now mining in the Camdozaal mine for ${formatDuration(duration)}.`;

	return str;
}

export async function camdozaalMineCommand(user: MUser, channelID: string) {
	const duration = calcMaxTripLength(user, 'Camdozaal');
	await addSubTaskToActivityTask<CamdozaalOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'Camdozaal',
		ctype: CamdozaalType.Mine
	});

	let str = `${user.minionName} is now doing the Brimhaven Agility Arena for ${formatDuration(duration)}.`;

	return str;
}
