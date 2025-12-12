import { formatDuration, Time } from '@oldschoolgg/toolkit';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';
export async function troubleBrewingStartCommand(user: MUser, channelId: string) {
	const timePerGame = Time.Minute * 20;
	const maxTripLength = await user.calcMaxTripLength('TroubleBrewing');
	const quantity = Math.floor(maxTripLength / timePerGame);
	const duration = quantity * timePerGame;

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		quantity,
		userID: user.id,
		duration,
		type: 'TroubleBrewing',
		channelId,
		minigameID: 'trouble_brewing'
	});

	return `${user.minionName} is now doing ${quantity}x games of Trouble Brewing! It will take ${formatDuration(
		duration
	)} to finish.`;
}
