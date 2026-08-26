import { MathRNG } from 'node-rng';
import { describe, expect, test } from 'vitest';

import { SimpleTable } from '@/structures/SimpleTable.js';

describe('SimpleTable', () => {
	test('returns null when there is nothing rollable', () => {
		expect(new SimpleTable().roll()).toEqual(null);
		expect(new SimpleTable().add('nothing', 0).roll()).toEqual(null);
	});

	test('rolls fractional weights without leaving a result unassigned', () => {
		const table = new SimpleTable<string>().add('a', 0.5).add('b', 0.5);
		const rng = {
			...MathRNG,
			randFloat: () => 0.999_999,
			randInt: () => {
				throw new Error('randInt should not be used for weighted SimpleTable rolls');
			}
		};

		expect(table.roll(rng)).toEqual('b');
	});

	test('does not select zero-weight items', () => {
		const table = new SimpleTable<string>().add('zero', 0).add('weighted', 1);
		const rng = {
			...MathRNG,
			randFloat: () => 0,
			randInt: () => 0
		};

		expect(table.roll(rng)).toEqual('weighted');
	});

	test('rejects invalid weights', () => {
		expect(() => new SimpleTable().add('x', -1)).toThrow('Invalid weight');
		expect(() => new SimpleTable().add('x', Number.NaN)).toThrow('Invalid weight');
	});
});
