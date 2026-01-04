import { formatDuration, Time } from '@oldschoolgg/toolkit';

import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';

export async function gemstoneFishingCommand(user: MUser, channelId: string, quantity: number | undefined) {
	const fishingLevel = user.skillsAsLevels.fishing;

	if (fishingLevel < 20) {
		return 'You need at least level 20 Fishing to catch gemstone fish.';
	}

	const inputQuantity = quantity;

	// Determine which fish they can catch based on level
	const availableFish = Fishing.gemstoneFishes.filter(fish => fishingLevel >= fish.level);
	const bestFish = availableFish[availableFish.length - 1];

	const maxTripLength = await user.calcMaxTripLength('GemstoneFishing');
	const timePerFish = bestFish.timeToFish * Time.Second;

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerFish);
	}
	const duration = timePerFish * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of gemstone fish you can catch is ${Math.floor(
			maxTripLength / timePerFish
		)}.`;
	}

	await ActivityManager.startTrip<ActivityTaskOptionsWithQuantity>({
		userID: user.id,
		channelId,
		quantity,
		iQty: inputQuantity,
		duration,
		type: 'GemstoneFishing'
	});

	// Calculate XP rate for display
	const catchesPerHour = Math.floor(Time.Hour / timePerFish);
	const xpPerHour = catchesPerHour * bestFish.xp;

	return `${user.minionName} is now fishing for gemstone fish (${bestFish.name}), it will take around ${formatDuration(
		duration
	)} to finish. (${xpPerHour.toLocaleString()} XP/hr)`;
}
