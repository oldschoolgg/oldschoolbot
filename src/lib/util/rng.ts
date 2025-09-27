import { bool, integer, MersenneTwister19937, nativeMath, nodeCrypto, Random, real } from 'random-js';

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

export function perHourChance(
	durationMilliseconds: number,
	oneInXPerHourChance: number,
	successFunction: () => unknown,
	options?: {
		randFloat?: (min: number, max: number) => number;
	}
) {
	if (durationMilliseconds <= 0 || oneInXPerHourChance <= 0) {
		return;
	}

	const rand = options?.randFloat ?? randFloat;

	const hoursPassed = durationMilliseconds / 3_600_000;
	if (hoursPassed <= 0) {
		return;
	}

	const ratePerHour = 1 / oneInXPerHourChance;
	if (ratePerHour <= 0) {
		return;
	}

	let elapsedHours = 0;
	while (true) {
		const randomValue = rand(0, 1);
		const clamped = Math.min(Math.max(randomValue, Number.EPSILON), 1 - Number.EPSILON);
		// Turn the uniform random number into the hours we wait before the next roll.
		// The formula `-log(1 - U) / ratePerHour` is how you get an exponential wait
		// time for a Poisson process, which is what controls these random events.
		const waitTime = -Math.log(1 - clamped) / ratePerHour;
		elapsedHours += waitTime;
		if (elapsedHours > hoursPassed) {
			break;
		}
		successFunction();
	}
}
