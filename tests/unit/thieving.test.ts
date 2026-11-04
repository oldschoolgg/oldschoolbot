import { describe, expect, test } from 'vitest';

import { stealables } from '@/lib/skilling/skills/thieving/stealables.js';
import { calcLootXPChest } from '@/lib/skilling/skills/thieving/thievingUtils.js';

describe('Thieving', () => {
	test('All stealables should have a table', () => {
		for (const entity of stealables) {
			if (!entity.table) {
				throw new Error(`No table for ${entity.name}.`);
			}
		}
	});

	test('All non-pickpocketables should have respawn times', () => {
		for (const entity of stealables) {
			if (entity.type !== 'pickpockable' && !entity.respawnTime) {
				throw new Error(`Missing respawn time for ${entity.name}.`);
			}
		}
	});

	test('Chests should not have pet chances', () => {
		for (const entity of stealables) {
			if (entity.type === 'chest' && entity.petChance !== undefined) {
				throw new Error(`Chest ${entity.name} should not have a pet chance.`);
			}
		}
	});

	test('Chests with success-rate data should apply chance and stun skips', () => {
		const chest = stealables.find(entity => entity.name === 'Isle of Souls chest')!;
		const [successfulQuantity, xpReceived, chanceOfSuccess] = calcLootXPChest(28, chest, 10, {
			percentChance: () => false,
			randInt: () => 100
		});

		expect(successfulQuantity).toBe(0);
		expect(xpReceived).toBe(0);
		expect(chanceOfSuccess).toBeCloseTo(20.3093, 4);
	});
});
