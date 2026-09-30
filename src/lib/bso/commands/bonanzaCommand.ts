import { dateFm } from '@oldschoolgg/discord';
import { formatDuration, getNextUTCReset, Time } from '@oldschoolgg/toolkit';
import { randomVariation } from 'node-rng';

import { CONSTANTS } from '@/lib/constants.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function bonanzaCommand(user: MUser, channelId: string) {
	if (await user.minionIsBusy()) return 'Your minion is busy.';
	const lastPlayedDate = Number(user.user.last_bonanza_date);
	const nextReset = getNextUTCReset(lastPlayedDate, CONSTANTS.BALTHAZARS_BIG_BONANZA_CD);

	if (Date.now() < nextReset) {
		return `You can only participate in Balthazar's Big Bonanza once per week, you can do it again in ${dateFm(new Date(nextReset))}.`;
	}

	const duration = randomVariation(Time.Minute * 15, 5);

	const str = `${
		user.minionName
	} is now off to participate in Balthazar's Big Bonanza! The total trip will take ${formatDuration(duration)}.`;

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelId,
		quantity: 1,
		duration,
		type: 'BalthazarsBigBonanza',
		minigameID: 'balthazars_big_bonanza'
	});

	return str;
}
