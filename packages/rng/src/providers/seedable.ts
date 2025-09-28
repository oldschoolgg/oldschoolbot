import { MersenneTwister19937, nodeCrypto, Random } from 'random-js';

import type { RNGProvider } from '../types.js';

export class SeedableRNG implements RNGProvider {
	private readonly engine: Random;

	constructor(seed?: number) {
		this.engine = seed ? new Random(MersenneTwister19937.seed(seed)) : new Random(nodeCrypto);
	}

	roll(max: number): boolean {
		return this.engine.bool(1 / max);
	}

	randInt(min: number, max: number): number {
		return this.engine.integer(min, max);
	}

	randFloat(min: number, max: number): number {
		return this.engine.real(min, max, true);
	}

	rand(): number {
		return this.engine.real(0, 1, false);
	}

	shuffle<T>(array: T[]): T[] {
		if (array.length === 0) return [] as T[];
		return this.engine.shuffle([...array]);
	}

	pick<T>(array: T[]): T {
		return this.engine.pick(array);
	}

	percentChance(percent: number): boolean {
		return this.engine.bool(percent / 100);
	}
}
