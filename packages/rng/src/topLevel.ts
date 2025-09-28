import { MathRNG } from './providers/math.js';

export function randInt(min: number, max: number) {
	return MathRNG.randInt(min, max);
}

export function percentChance(percent: number) {
	return MathRNG.percentChance(percent);
}

export function roll(max: number) {
	if (max > 9007199254742) {
		throw new Error(`roll number too big, got ${max}`);
	}
	return MathRNG.roll(max);
}

/**
 * Picks a random item from an array.
 * @param array The array to pick from.
 */
export function randArrItem<T>(array: readonly T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns a shuffled copy of an array.
 *
 * @param array The array to shuffle.
 */
export function shuffleArr<T>(array: readonly T[]): T[] {
	const copy = [...array];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

export function randFloat(min: number, max: number) {
	return MathRNG.randFloat(min, max);
}

/**
 * Adds random variation to a number. For example, if you pass 10%, it can at most lower the value by 10%,
 * or increase it by 10%, and everything in between.
 * @param value The value to add variation too.
 * @param percentage The max percentage to fluctuate the value by, in both negative/positive.
 */
export function randomVariation(value: number, percentage: number) {
	const lowerLimit = value * (1 - percentage / 100);
	const upperLimit = value * (1 + percentage / 100);
	return MathRNG.randFloat(lowerLimit, upperLimit);
}
