import { formatDuration, Time } from '@oldschoolgg/toolkit';

import { getGatheringSpeedBonus, type IslandUpgradeTiers } from '@/lib/bso/commands/islandUpgrades.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';

export async function gemstoneFishingCommand(user: MUser, channelId: string, quantity: number | undefined) {
	const fishingLevel = user.skillsAsLevels.fishing;

	if (fishingLevel < 20) {
		return 'You need at least level 20 Fishing to catch Gemscales.';
	}

	const inputQuantity = quantity;

	const availableFish = Fishing.gemstoneFishes.filter(fish => fishingLevel >= fish.level);
	const bestFish = availableFish[availableFish.length - 1];

	const maxTripLength = await user.calcMaxTripLength('GemstoneFishing');

	const gatheringBonus = getGatheringSpeedBonus((user.user.island_upgrades ?? {}) as Partial<IslandUpgradeTiers>);
	const timePerFish = bestFish.timeToFish * Time.Second * (1 - gatheringBonus);

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerFish);
	}
	const duration = timePerFish * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of Gemscales you can catch is ${Math.floor(
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

	const catchesPerHour = Math.floor(Time.Hour / timePerFish);
	const xpPerHour = catchesPerHour * bestFish.xp;
	const boostStr = gatheringBonus > 0 ? ` (${gatheringBonus * 100}% gathering speed boost applied)` : '';

	return `${user.minionName} is now fishing for Gemscales, it will take around ${formatDuration(
		duration
	)} to finish. (${xpPerHour.toLocaleString()} XP/hr)${boostStr}`;
}