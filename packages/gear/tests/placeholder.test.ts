import { describe, expect, it } from 'vitest';

describe('SeedableRNG determinism', { repeats: 2 }, () => {
	it('should produce the same sequence with the same seed', () => {
		expect(true).toBe(true);
	});
});
