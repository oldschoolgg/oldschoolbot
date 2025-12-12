import { evalMathExpression } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';

import type { KillableMonster } from '@/lib/minions/types.js';
import type { Rune } from '@/lib/skilling/skills/runecraft.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
export function mahojiParseNumber({
	input,
	min,
	max
}: {
	input: number | string | undefined | null;
	min?: number;
	max?: number;
}): number | null {
	if (input === undefined || input === null) return null;
	const parsed = typeof input === 'number' ? input : evalMathExpression(input);
	if (parsed === null) return null;
	if (min && parsed < min) return null;
	if (max && parsed > max) return null;
	if (Number.isNaN(parsed)) return null;
	return parsed;
}

export function resolveAvailableItemBoosts(gearBank: GearBank, monster: KillableMonster, isInWilderness = false): Bank {
	const boosts = new Bank();
	if (monster.itemInBankBoosts) {
		for (const boostSet of monster.itemInBankBoosts) {
			let highestBoostAmount = 0;
			let highestBoostItem = 0;

			// find the highest boost that the player has
			for (const [itemID, boostAmount] of Object.entries(boostSet)) {
				const parsedId = Number.parseInt(itemID);
				if (!gearBank.wildyGearCheck(parsedId, isInWilderness)) {
					continue;
				}
				if (boostAmount > highestBoostAmount) {
					highestBoostAmount = boostAmount;
					highestBoostItem = parsedId;
				}
			}

			if (highestBoostAmount && highestBoostItem) {
				boosts.add(highestBoostItem, highestBoostAmount);
			}
		}
	}
	return boosts;
}

export function calcMaxRCQuantity(rune: Rune, user: MUser) {
	const level = user.skillLevel('runecraft');
	for (let i = rune.levels.length; i > 0; i--) {
		const [levelReq, qty] = rune.levels[i - 1];
		if (level >= levelReq) return qty;
	}

	return 0;
}

export async function addToOpenablesScores(user: MUser, kcBank: Bank) {
	const currentOpenableScores = await user.fetchUserStat('openable_scores');
	await user.statsUpdate({
		openable_scores: new Bank(currentOpenableScores as ItemBank).add(kcBank).toJSON()
	});
	const newOpenableScores = await user.fetchUserStat('openable_scores');
	return new Bank(newOpenableScores as ItemBank);
}
