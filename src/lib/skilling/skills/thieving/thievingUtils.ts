import { ItemGroups } from 'oldschooljs';

import type { Stealable } from './stealables.js';

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

export function calcLootXPChest(
	currentLevel: number,
	chest: Stealable,
	quantity: number,
	rng: { percentChance: (percent: number) => boolean; randInt: (min: number, max: number) => number }
): [number, number, number] {
	let xpReceived = 0;
	let successful = 0;
	const timeToSteal = chest.respawnTime!;
	const chanceOfSuccess =
		chest.slope !== undefined && chest.intercept !== undefined
			? normaliseChance(chest.slope * currentLevel + chest.intercept)
			: rng.randInt(95, 100);

	for (let i = 0; i < quantity; i++) {
		if (!rng.percentChance(chanceOfSuccess)) {
			if (chest.stunTime) {
				i += Math.round(chest.stunTime / timeToSteal);
			}
			continue;
		}

		successful++;
		xpReceived += chest.xp;
	}

	return [successful, xpReceived, chanceOfSuccess];
}
