import { MersenneTwister19937, Random, bool, integer, nativeMath, nodeCrypto, real } from 'random-js';

const randEngine = process.env.TEST ? nativeMath : nodeCrypto;

export function cryptoRand(min: number, max: number) {
	return integer(min, max)(randEngine);
}

export function randFloat(min: number, max: number) {
	return real(min, max)(randEngine);
}

export function percentChance(percent: number) {
	return bool(percent / 100)(randEngine);
}

export function roll(max: number) {
	return cryptoRand(1, max) === 1;
}

export class SeededRNG {
	private readonly engine: Random;

	constructor(seed: number) {
		const mt = MersenneTwister19937.seed(seed);
		this.engine = new Random(mt);
	}

	nextInt(min: number, max: number): number {
		return this.engine.integer(min, max);
	}

	nextFloat(min: number, max: number): number {
		return this.engine.real(min, max, true);
	}

	next01(): number {
		return this.engine.real(0, 1, false);
	}

	shuffle<T>(array: T[]): T[] {
		return this.engine.shuffle([...array]);
	}

	pick<T>(array: T[]): T {
		return this.engine.pick(array);
	}
}
