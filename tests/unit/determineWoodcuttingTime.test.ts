import { EItem } from 'oldschooljs/EItem';
import { describe, expect, it } from 'vitest';

import { determineWoodcuttingTime } from '@/lib/skilling/functions/determineWoodcuttingTime.js';
import Woodcutting from '@/lib/skilling/skills/woodcutting/woodcutting.js';

function createRNG(results: boolean[]): RNGProvider {
	return {
		percentChance: () => {
			const result = results.shift();
			if (result === undefined) {
				throw new Error('RNG sequence exhausted');
			}
			return result;
		}
	} as unknown as RNGProvider;
}

describe('determineWoodcuttingTime', () => {
	const teakLog = Woodcutting.Logs.find(log => log.id === EItem.TEAK_LOGS)!;

	it('uses 2-tick chop and 2-tick tree finding for teak when not 1.5t', () => {
		const [duration, quantity] = determineWoodcuttingTime({
			quantity: 1,
			user: {
				skillsAsLevels: { farming: 1 },
				hasEquippedOrInBank: () => false
			} as unknown as MUser,
			log: teakLog,
			axeMultiplier: 1,
			powerchopping: true,
			forestry: false,
			woodcuttingLvl: 99,
			maxTripLength: 10_000,
			rng: createRNG([true, true])
		});

		expect(quantity).toBe(1);
		expect(duration).toBe(1200);
	});

	it('uses 1.5-tick chop and 1.5-tick tree finding for teak when 1.5t eligible', () => {
		const [duration, quantity] = determineWoodcuttingTime({
			quantity: 1,
			user: {
				skillsAsLevels: { farming: 35 },
				hasEquippedOrInBank: () => false
			} as unknown as MUser,
			log: teakLog,
			axeMultiplier: 1,
			powerchopping: true,
			forestry: false,
			woodcuttingLvl: 92,
			maxTripLength: 10_000,
			rng: createRNG([true, true])
		});

		expect(quantity).toBe(1);
		expect(duration).toBeCloseTo(900);
	});
});
