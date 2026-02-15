import { formatDuration, Time } from '@oldschoolgg/toolkit';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function castleWarsStartCommand(user: MUser, channelId: string, quantity?: number) {
	if (await user.minionIsBusy()) return `${user.minionName} is busy.`;
	const gameLength = Time.Minute * 20;
	const userMaxGames = Math.floor((await user.calcMaxTripLength('CastleWars')) / gameLength);
	if (!quantity || quantity > userMaxGames) {
		quantity = userMaxGames;
	}

	const duration = quantity * gameLength;

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelId,
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
	const kc = await user.fetchMinigameScore('castle_wars');
	return `You have **${bank.amount('Castle wars ticket')}** Castle wars tickets.
You have **${bank.amount('Castle wars supply crate')}** Castle wars supply crates.
You have played ${kc} Castle Wars games.`;
}
