import { describe, expect, it } from 'vitest';

import { SeedableRNG } from '../src/providers/seedable.js';

describe('SeedableRNG determinism', { repeats: 2 }, () => {
	it('should produce the same sequence with the same seed', () => {
		const rng1 = new SeedableRNG(123);
		const rng2 = new SeedableRNG(123);

		const seq1 = Array.from({ length: 20 }, () => rng1.rand());
		const seq2 = Array.from({ length: 20 }, () => rng2.rand());

		expect(seq1).toEqual(seq2);
	});

	it('should shuffle same with the same seed', () => {
		const src = [1, 2, 3, 4, 5];
		const rng1 = new SeedableRNG(123);
		const rng2 = new SeedableRNG(123);

		expect(rng1.shuffle(src)).toEqual(rng2.shuffle(src));
	});

	it('should produce different sequences with different seeds', () => {
		const rng1 = new SeedableRNG(123);
		const rng2 = new SeedableRNG(456);

		const seq1 = Array.from({ length: 20 }, () => rng1.rand());
		const seq2 = Array.from({ length: 20 }, () => rng2.rand());

		expect(seq1).not.toEqual(seq2);
	});

	it('randInt should always stay in range', () => {
		const rng = new SeedableRNG(42);
		for (let i = 0; i < 100; i++) {
			const n = rng.randInt(5, 10);
			expect(n).toBeGreaterThanOrEqual(5);
			expect(n).toBeLessThanOrEqual(10);
		}
	});

	it('percentChance(0) should always be false', () => {
		const rng = new SeedableRNG(99);
		for (let i = 0; i < 50; i++) {
			expect(rng.percentChance(0)).toBe(false);
		}
	});

	it('percentChance(100) should always be true', () => {
		const rng = new SeedableRNG(99);
		for (let i = 0; i < 50; i++) {
			expect(rng.percentChance(100)).toBe(true);
		}
	});

	it('pick should always return an element from the array', () => {
		const rng = new SeedableRNG(7);
		const arr = ['a', 'b', 'c'];
		for (let i = 0; i < 20; i++) {
			expect(arr.includes(rng.pick(arr))).toBe(true);
		}
	});

	it('shuffle should keep the same elements', () => {
		const rng = new SeedableRNG(1);
		const arr = [1, 2, 3, 4, 5];
		const shuffled = rng.shuffle(arr);
		expect(shuffled.sort()).toEqual(arr.sort());
	});
});
