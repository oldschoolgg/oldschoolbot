import { nodeCrypto, Random } from 'random-js';

import type { RNGProvider } from '../types.js';

export class NodeCryptoRNG implements RNGProvider {
	private readonly engine: Random = new Random(nodeCrypto);

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
