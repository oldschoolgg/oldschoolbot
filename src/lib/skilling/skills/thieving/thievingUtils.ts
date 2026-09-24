import { ItemGroups } from 'oldschooljs';

import type { Stealable } from './stealables.js';

export const DEFAULT_CHEST_SUCCESS_PERCENT = 97.5;

export function rogueOutfitPercentBonus(user: MUser): number {
	const skillingSetup = user.gear.skilling;
	let amountEquipped = 0;
	for (const id of ItemGroups.rogueOutfit) {
		if (skillingSetup.hasEquipped([id])) {
			amountEquipped++;
		}
	}
	return amountEquipped * 20;
}

function normaliseChance(chance: number): number {
	return Math.max(0, Math.min(100, chance <= 1 ? chance * 100 : chance));
}

export function calcChestSuccessPercent(
	currentLevel: number,
	chest: Stealable,
	fallbackSuccessPercent = DEFAULT_CHEST_SUCCESS_PERCENT
): number {
	return chest.slope !== undefined && chest.intercept !== undefined
		? normaliseChance(chest.slope * currentLevel + chest.intercept)
		: fallbackSuccessPercent;
}

export function calcChestFailureSkipCount(chest: Stealable): number {
	return chest.stunTime && chest.respawnTime ? Math.round(chest.stunTime / chest.respawnTime) : 0;
}

export function calcChestXPPerHour(
	chest: Stealable,
	currentLevel = chest.level,
	fallbackSuccessPercent = DEFAULT_CHEST_SUCCESS_PERCENT
): number {
	const successRate = calcChestSuccessPercent(currentLevel, chest, fallbackSuccessPercent) / 100;
	const xpPerAction = chest.xp * successRate;
	const effectiveActionTime = chest.respawnTime! * (1 + (1 - successRate) * calcChestFailureSkipCount(chest));
	return (xpPerAction / effectiveActionTime) * 3_600_000;
}

export function calcLootXPChest(
	currentLevel: number,
	chest: Stealable,
	quantity: number,
	rng: { percentChance: (percent: number) => boolean; randInt: (min: number, max: number) => number }
): [number, number, number] {
	let xpReceived = 0;
	let successful = 0;
	const chanceOfSuccess = calcChestSuccessPercent(currentLevel, chest, rng.randInt(95, 100));
	const failureSkipCount = calcChestFailureSkipCount(chest);

	for (let i = 0; i < quantity; i++) {
		if (!rng.percentChance(chanceOfSuccess)) {
			i += failureSkipCount;
			continue;
		}

		successful++;
		xpReceived += chest.xp;
	}

	return [successful, xpReceived, chanceOfSuccess];
}
