import { MersenneTwister19937, Random, bool, integer, nativeMath, nodeCrypto, real } from 'random-js';

const randEngine = process.env.TEST ? nativeMath : nodeCrypto;

export function cryptoRand(min: number, max: number) {
	return integer(min, max)(randEngine);
}

export function randFloat(min: number, max: number) {
	return real(min, max)(randEngine);
}

export function randInt(min: number, max: number) {
	return integer(min, max)(randEngine);
}

export function percentChance(percent: number) {
	return bool(percent / 100)(randEngine);
}

export function roll(max: number) {
	return cryptoRand(1, max) === 1;
}

export interface RNGProvider {
	roll: (max: number) => boolean;
	randInt(min: number, max: number): number;
	randFloat(min: number, max: number): number;
	rand(): number;
	shuffle<T>(array: T[]): T[];
	pick<T>(array: T[]): T;
	percentChance(percent: number): boolean;
}

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
		return this.engine.shuffle([...array]);
	}

	pick<T>(array: T[]): T {
		return this.engine.pick(array);
	}

	percentChance(percent: number): boolean {
		return this.engine.bool(percent / 100);
	}
}
