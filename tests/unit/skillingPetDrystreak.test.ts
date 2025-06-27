import { convertLVLtoXP } from 'oldschooljs/dist/util';
import { describe, expect, test } from 'vitest';
import { MAX_XP } from '../../src/lib/constants';
import { computeChance } from '../../src/lib/util/skillingPetDrystreak';

describe('computeChance', () => {
	test('computes chance based on xp', () => {
		expect(computeChance(100, 0)).toBe(75);
		expect(computeChance(100, convertLVLtoXP(99))).toBe(1);
		expect(computeChance(100, MAX_XP)).toBe(0);
	});
});
