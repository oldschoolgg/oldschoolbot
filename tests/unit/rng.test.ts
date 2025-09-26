import { describe, expect, it, vi } from 'vitest';

import * as rng from '../../src/lib/util/rng.js';

describe('perHourChance', () => {
	it('fires for partial hours when the random wait is short enough', () => {
		const callback = vi.fn();
		const randFloatSpy = vi.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);

		rng.perHourChance(30 * 60 * 1000, 2, callback, { randFloat: randFloatSpy });

		expect(callback).toHaveBeenCalledTimes(1);
		expect(randFloatSpy).toHaveBeenCalledTimes(2);
	});

	it('can trigger multiple successes over longer durations', () => {
		const callback = vi.fn();
		const randFloatSpy = vi
			.fn()
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.1)
			.mockReturnValueOnce(0.9);

		rng.perHourChance(90 * 60 * 1000, 2, callback, { randFloat: randFloatSpy });

		expect(callback).toHaveBeenCalledTimes(3);
		expect(randFloatSpy).toHaveBeenCalledTimes(4);
	});

	it('supports rates higher than one success per hour', () => {
		const callback = vi.fn();
		const randFloatSpy = vi.fn().mockImplementation(() => 0.1);

		rng.perHourChance(60 * 60 * 1000, 0.5, callback, { randFloat: randFloatSpy });

		expect(callback).toHaveBeenCalledTimes(18);
		expect(randFloatSpy).toHaveBeenCalledTimes(19);
	});

	it('ignores invalid durations or chances', () => {
		const callback = vi.fn();
		const randFloatSpy = vi.spyOn(rng, 'randFloat');

		rng.perHourChance(0, 2, callback);
		rng.perHourChance(1000, 0, callback);

		expect(callback).not.toHaveBeenCalled();
		expect(randFloatSpy).not.toHaveBeenCalled();

		randFloatSpy.mockRestore();
	});
});
