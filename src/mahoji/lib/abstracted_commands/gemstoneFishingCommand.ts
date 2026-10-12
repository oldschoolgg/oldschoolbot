import {
	defaultMaintenanceTimestamps,
	getGatheringSpeedBonus,
	type IslandUpgradeTiers
} from '@/lib/bso/commands/islandUpgrades.js';
import { InventionID, inventionItemBoost } from '@/lib/bso/skills/invention/inventions.js';

import { formatDuration, Time } from '@oldschoolgg/toolkit';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { getBestAvailableFish } from '@/tasks/minions/gemstoneFishingActivity.js';

export function getBestEquippedHarpoon(
	user: MUser
): { name: string; speedMultiplier: number; bonusPercent: number } | null {
	const fishingLevel = user.skillsAsLevels.fishing;

	if (fishingLevel >= 71 && user.hasEquippedOrInBank('Crystal harpoon')) {
		return { name: 'Crystal harpoon', speedMultiplier: 0.9, bonusPercent: 10 };
	}
	if (
		fishingLevel >= 61 &&
		(user.hasEquippedOrInBank('Dragon harpoon') ||
			user.hasEquippedOrInBank('Dragon harpoon (or)') ||
			user.hasEquippedOrInBank('Infernal harpoon') ||
			user.hasEquippedOrInBank('Infernal harpoon (uncharged)'))
	) {
		return { name: 'Dragon harpoon', speedMultiplier: 0.94, bonusPercent: 6 };
	}
	if (fishingLevel >= 35 && (user.hasEquippedOrInBank('Barb-tail harpoon') || user.hasEquippedOrInBank('Harpoon'))) {
		return { name: 'Harpoon', speedMultiplier: 1.0, bonusPercent: 0 };
	}

	return null;
}

export async function gemstoneFishingCommand(user: MUser, channelId: string, quantity: number | undefined) {
	const fishingLevel = user.skillsAsLevels.fishing;

	if (fishingLevel < 20) {
		return 'You need at least level 20 Fishing to catch Gemscales.';
	}

	const harpoon = getBestEquippedHarpoon(user);
	const hasMechaRod = user.hasEquippedOrInBank('Mecha rod');
	if (!harpoon && !hasMechaRod) {
		return 'You need a harpoon equipped or in your bank to fish for Gemscales.';
	}

	const inputQuantity = quantity;

	const bestFish = getBestAvailableFish(fishingLevel);

	const maxTripLength = await user.calcMaxTripLength('GemstoneFishing');

	let toolMultiplier = harpoon ? harpoon.speedMultiplier : 1.0;
	let usedMechaRod = false;
	if (hasMechaRod) {
		const boostRes = await inventionItemBoost({
			user,
			inventionID: InventionID.MechaRod,
			duration: maxTripLength
		});
		if (boostRes.success) {
			toolMultiplier = 0.7;
			usedMechaRod = true;
		}
	}

	const islandMaint = (user.user.island_upgrades as any)?.maintenance ?? defaultMaintenanceTimestamps;
	const islandAssign = (user.user.island_upgrades as any)?.assignment ?? null;
	const gatheringBonus = getGatheringSpeedBonus(
		(user.user.island_upgrades ?? {}) as Partial<IslandUpgradeTiers>,
		islandMaint,
		islandAssign
	);
	const timePerFish = bestFish.timeToFish * Time.Second * (1 - gatheringBonus) * toolMultiplier;

	if (!quantity) {
		quantity = Math.floor(maxTripLength / timePerFish);
	}
	const duration = timePerFish * quantity;

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest number of Gemscales you can catch is ${Math.floor(
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
	const boosts: string[] = [];
	if (usedMechaRod) {
		boosts.push('30% faster from Mecha rod');
	} else if (harpoon && harpoon.bonusPercent !== 0) {
		boosts.push(`${harpoon.bonusPercent}% faster from ${harpoon.name}`);
	}
	if (gatheringBonus > 0) boosts.push(`${(gatheringBonus * 100).toFixed(0)}% Expedition Outfitters boost`);
	const boostStr = boosts.length > 0 ? ` (${boosts.join(', ')})` : '';

	return `${user.minionName} is now fishing for Gemscales, it will take around ${formatDuration(
		duration
	)} to finish. (${xpPerHour.toLocaleString()} XP/hr)${boostStr}`;
}
