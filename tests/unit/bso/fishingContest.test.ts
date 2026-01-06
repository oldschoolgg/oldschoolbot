import { getCurrentFishType } from '@/lib/bso/minigames/fishingContest.js';

import { describe, expect, test } from 'vitest';

describe('getCurrentFishType', () => {
	test('returns consistent fish type across timezones on the same UTC day', () => {
		const utcDate = new Date('2024-01-01T00:00:00Z');
		const offsetDate = new Date('2023-12-31T18:00:00-06:00');

		expect(getCurrentFishType(utcDate)).toEqual(getCurrentFishType(offsetDate));
	});
});
