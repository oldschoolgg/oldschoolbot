import { randomVariation } from '@oldschoolgg/rng';
import { formatDuration, Time } from '@oldschoolgg/toolkit';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function bonanzaCommand(user: MUser, channelId: string) {
	if (await user.minionIsBusy()) return 'Your minion is busy.';
	const lastPlayedDate = Number(user.user.last_bonanza_date);
	const difference = Date.now() - lastPlayedDate;
	if (difference < Time.Day * 7) {
		const duration = formatDuration(Date.now() - (lastPlayedDate + Time.Day * 7));
		return `You can only participate in Balthazar's Big Bonanza once per week, you can do it again in ${duration}.`;
	}

	const duration = randomVariation(Time.Minute * 15, 5);

	const str = `${user.minionName
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
