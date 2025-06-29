import { type Tame, tame_growth } from '@prisma/client';
import { describe, expect, test } from 'vitest';

import { calculateMaximumTameFeedingLevelGain } from '../../../src/lib/util/tameUtil';

describe('Sanity', () => {
	test('calculateMaximumTameFeedingLevelGain', () => {
		expect(
			calculateMaximumTameFeedingLevelGain({
				species_id: 1,
				max_combat_level: 70,
				growth_stage: tame_growth.adult
			} as Tame)
		).toEqual(14);
	});
});
