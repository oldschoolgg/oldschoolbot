import { describe, expect, it, vi } from 'vitest';

import * as rng from '../../src/lib/util/rng.js';

describe('perHourChance', () => {
	it('fires for partial hours when the random roll is below the threshold', () => {
		const callback = vi.fn();
		const randFloatSpy = vi.spyOn(rng, 'randFloat').mockReturnValue(0);

		rng.perHourChance(30 * 60 * 1000, 2, callback);

		expect(callback).toHaveBeenCalledTimes(1);
		expect(randFloatSpy).toHaveBeenCalledTimes(1);

		randFloatSpy.mockRestore();
	});

	it('rolls once per full hour and once for the remainder', () => {
		const callback = vi.fn();
		const randFloatSpy = vi.spyOn(rng, 'randFloat').mockReturnValueOnce(0.4).mockReturnValueOnce(0.6);

		rng.perHourChance(90 * 60 * 1000, 2, callback);

		expect(callback).toHaveBeenCalledTimes(1);
		expect(randFloatSpy).toHaveBeenCalledTimes(2);

		randFloatSpy.mockRestore();
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
