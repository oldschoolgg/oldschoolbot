import { calcWhatPercent, formatDuration, reduceNumByPercent, Time } from '@oldschoolgg/toolkit';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function fishingTrawlerCommand(user: MUser, channelID: string) {
	if (user.skillLevel('fishing') < 15) {
		return 'You need at least level 15 Fishing to do the Fishing Trawler.';
	}

	const tripsDone = await user.fetchMinigameScore('fishing_trawler');

	let tripLength = Time.Minute * 13;
	// 10% boost for 50 trips done
	const boost = Math.min(100, calcWhatPercent(tripsDone, 50)) / 10;
	tripLength = reduceNumByPercent(tripLength, boost);

	const quantity = Math.floor((await user.calcMaxTripLength('FishingTrawler')) / tripLength);
	const duration = quantity * tripLength;

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID,
		type: 'FishingTrawler',
		minigameID: 'fishing_trawler',
		quantity,
		duration
	});

	return `${user.minionName} is now doing ${quantity}x Fishing Trawler trips, it will take around ${formatDuration(
		duration
	)} to finish.\n\n**Boosts:** ${boost}% boost for experience`;
}
