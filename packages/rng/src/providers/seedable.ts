import * as prand from 'pure-rand';

import type { RNGProvider } from '../types.js';

export class SeedableRNG implements RNGProvider {
	private rng: prand.RandomGenerator;

	constructor(seed: number) {
		this.rng = prand.xoroshiro128plus(seed);
	}

	rand(): number {
		const g1 = prand.unsafeUniformIntDistribution(0, (1 << 26) - 1, this.rng);
		const g2 = prand.unsafeUniformIntDistribution(0, (1 << 27) - 1, this.rng);
		return (g1 * 2 ** 27 + g2) * 2 ** -53;
	}

	randInt(min: number, max: number): number {
		return prand.unsafeUniformIntDistribution(min, max, this.rng);
	}

	randFloat(min: number, max: number): number {
		return min + (max - min) * this.rand();
	}

	roll(max: number): boolean {
		return this.randInt(1, max) === 1;
	}

	shuffle<T>(array: T[]): T[] {
		const arr = [...array];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = this.randInt(0, i);
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	pick<T>(array: T[]): T {
		return array[this.randInt(0, array.length - 1)];
	}

	percentChance(percent: number): boolean {
		return this.rand() < percent / 100;
	}

	randomVariation(value: number, percentage: number): number {
		const lowerLimit = value * (1 - percentage / 100);
		const upperLimit = value * (1 + percentage / 100);
		return this.randFloat(lowerLimit, upperLimit);
	}
}
