import { Bank } from 'oldschooljs';

import type { SailingActivity } from '@/lib/skilling/skills/sailing/activities.js';
import type { SailingShipSnapshot } from '@/lib/skilling/skills/sailing/ship.js';
import { getShipBonusesFromSnapshot } from '@/lib/skilling/skills/sailing/ship.js';

export function calcSailingTripStart({
	activity,
	maxTripLength,
	quantityInput,
	ship,
	timeMultiplier = 1
}: {
	activity: SailingActivity;
	maxTripLength: number;
	quantityInput?: number;
	ship: SailingShipSnapshot;
	timeMultiplier?: number;
}) {
	const { speedMultiplier } = getShipBonusesFromSnapshot(ship);
	const durationPerAction = Math.max(1000, Math.floor(activity.baseTime * speedMultiplier * timeMultiplier));

	const maxQuantity = Math.max(1, Math.floor(maxTripLength / durationPerAction));
	const quantity = quantityInput ? Math.min(quantityInput, maxQuantity) : maxQuantity;
	const duration = quantity * durationPerAction;

	const boosts = [];
	if (speedMultiplier < 1) {
		const speedPercent = Math.round((1 - speedMultiplier) * 100);
		boosts.push(`${speedPercent}% faster ship`);
	}

	return { quantity, duration, boosts };
}

export function calcSailingTripResult({
	activity,
	quantity,
	ship,
	sailingLevel,
	xpMultiplier = 1,
	lootMultiplier = 1,
	baseRiskOverride
}: {
	activity: SailingActivity;
	quantity: number;
	ship: SailingShipSnapshot;
	sailingLevel: number;
	xpMultiplier?: number;
	lootMultiplier?: number;
	baseRiskOverride?: number;
}) {
	const { successBonus, lootBonus } = getShipBonusesFromSnapshot(ship);
	const levelDelta = sailingLevel - activity.level;
	const levelBonus = Math.max(0, Math.min(0.2, levelDelta * 0.005));
	const baseRisk = baseRiskOverride ?? activity.baseRisk;
	const successChance = Math.max(0.05, Math.min(0.98, 1 - baseRisk + successBonus + levelBonus));
	const successfulActions = Math.floor(quantity * successChance);
	const failedActions = quantity - successfulActions;

	const loot = new Bank();
	if (successfulActions > 0) {
		const lootRolls = Math.max(1, Math.floor(successfulActions * lootMultiplier));
		loot.add(activity.lootTable.roll(lootRolls));
	}

	const bonusRolls = Math.floor(successfulActions * lootBonus);
	if (bonusRolls > 0) {
		loot.add(activity.lootTable.roll(bonusRolls));
	}

	const xpReceived = Math.floor(successfulActions * activity.xp * xpMultiplier);

	return {
		successfulActions,
		failedActions,
		xpReceived,
		loot,
		successChance,
		bonusRolls
	};
}
