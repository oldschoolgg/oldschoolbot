import { Time } from 'e';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { getMinigameEntity } from '../../../lib/settings/settings';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';

export async function castleWarsStartCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) return `${user.minionName} is busy.`;
	const gameLength = Time.Minute * 18;
	const quantity = Math.floor(calcMaxTripLength(user, 'CastleWars') / gameLength);
	const duration = quantity * gameLength;

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID: channelID.toString(),
		duration,
		type: 'CastleWars',
		quantity,
		minigameID: 'castle_wars'
	});

	return `${
		user.minionName
	} is now doing ${quantity} games of Castle Wars. The trip will take around ${formatDuration(duration)}.`;
}
export async function castleWarsStatsCommand(user: MUser) {
	const { bank } = user;
	const kc = await getMinigameEntity(user.id);
	return `You have **${bank.amount('Castle wars ticket')}** Castle wars tickets.
You have played ${kc.castle_wars} Castle Wars games.`;
}
