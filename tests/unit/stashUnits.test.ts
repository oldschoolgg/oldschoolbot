import { describe, expect, test } from 'vitest';

import { allStashUnitsFlat } from '@/lib/clues/stashUnits.js';

describe('Stash Units', () => {
	test('Stash Units should not have more than 6 items at the top level', () => {
		for (const x of allStashUnitsFlat) {
			expect(x.items.length).toBeLessThan(6);
		}
	});
});
