import { describe, expect, it } from 'vitest';

import { MathRNG } from '../src/providers/math.js';
import { NodeCryptoRNG } from '../src/providers/nodecrypto.js';
import { SeedableRNG } from '../src/providers/seedable.js';

const providers = [new NodeCryptoRNG(), new SeedableRNG(1), new SeedableRNG(2), MathRNG];

describe('providers', { repeats: 2 }, () => {
	for (const rng of providers) {
		it('roll should return true roughly 1/max of the time', () => {
			let count = 0;
			const max = 10;
			for (let i = 0; i < 1000; i++) {
				if (rng.roll(max)) count++;
			}
			expect(count).toBeGreaterThan(50);
			expect(count).toBeLessThan(150);
		});

		it('randInt should return numbers in range', () => {
			for (let i = 0; i < 1000; i++) {
				const n = rng.randInt(5, 10);
				expect(n).toBeGreaterThanOrEqual(5);
				expect(n).toBeLessThanOrEqual(10);
			}
		});

		it('randFloat should return numbers in range', () => {
			for (let i = 0; i < 1000; i++) {
				const n = rng.randFloat(1.5, 2.5);
				expect(n).toBeGreaterThanOrEqual(1.5);
				expect(n).toBeLessThanOrEqual(2.5);
			}
		});

		it('rand should return numbers between 0 and 1', () => {
			for (let i = 0; i < 1000; i++) {
				const n = rng.rand();
				expect(n).toBeGreaterThanOrEqual(0);
				expect(n).toBeLessThan(1);
			}
		});

		it('shuffle should return same elements in different order', () => {
			const arr = [1, 2, 3, 4, 5];
			const shuffled = rng.shuffle(arr);
			expect(shuffled.sort()).toEqual(arr.sort());
		});

		it('pick should return an element from the array', () => {
			const arr = ['a', 'b', 'c'];
			const val = rng.pick(arr);
			expect(arr.includes(val)).toBe(true);
		});

		it('percentChance should return true about given % of the time', () => {
			let count = 0;
			for (let i = 0; i < 1000; i++) {
				if (rng.percentChance(25)) count++;
			}
			expect(count).toBeGreaterThan(150);
			expect(count).toBeLessThan(350);
		});

		it('randInt should always return the single value when min == max', () => {
			for (let i = 0; i < 1000; i++) {
				expect(rng.randInt(5, 5)).toBe(5);
			}
		});

		it('pick should always return the only element in a single-element array', () => {
			for (let i = 0; i < 1000; i++) {
				expect(rng.pick(['only'])).toBe('only');
			}
		});

		it('shuffle should return an empty array for empty input', () => {
			expect(rng.shuffle([])).toEqual([]);
		});

		it('shuffle should return same single element for single-element array', () => {
			expect(rng.shuffle([42])).toEqual([42]);
		});

		it('percentChance(0) should always be false', () => {
			for (let i = 0; i < 1000; i++) {
				expect(rng.percentChance(0)).toBe(false);
			}
		});

		it('percentChance(100) should always be true', () => {
			for (let i = 0; i < 1000; i++) {
				expect(rng.percentChance(100)).toBe(true);
			}
		});
	}
});
