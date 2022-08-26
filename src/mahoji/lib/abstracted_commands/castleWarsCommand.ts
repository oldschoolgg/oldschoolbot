import { Time } from 'e';
import { KlasaUser } from 'klasa';

import { getMinigameEntity } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function castleWarsStartCommand(klasaUser: KlasaUser, channelID: bigint) {
	if (klasaUser.minionIsBusy) return `${klasaUser.minionName} is busy.`;
	const gameLength = Time.Minute * 18;
	const quantity = Math.floor(calcMaxTripLength(klasaUser, 'CastleWars') / gameLength);
	const duration = quantity * gameLength;

	await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
		userID: klasaUser.id,
		channelID: channelID.toString(),
		duration,
		type: 'CastleWars',
		quantity,
		minigameID: 'castle_wars'
	});

	return `${
		klasaUser.minionName
	} is now doing ${quantity} games of Castle Wars. The trip will take around ${formatDuration(duration)}.`;
}
export async function castleWarsStatsCommand(klasaUser: KlasaUser) {
	const bank = klasaUser.bank();
	const kc = await getMinigameEntity(klasaUser.id);
	return `You have **${bank.amount('Castle wars ticket')}** Castle wars tickets.
You have played ${kc.castle_wars} Castle Wars games.`;
}
