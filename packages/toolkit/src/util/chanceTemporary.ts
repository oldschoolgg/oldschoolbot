/**
 * Rolls a random number inclusively between a min and max.
 *
 * @param min The lower limit of the roll
 * @param max The upper limit of the roll
 */
export function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Rolls a random floating point number inclusively between min and max.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {number} A random float
 */
export function randFloat(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

/**
 * Rolls a 1 in X chance, returning true on successfull rolls.
 *
 * @param upperLimit The upper limit of the roll
 */
export function roll(upperLimit: number): boolean {
	return randInt(1, upperLimit) === 1;
}

/**
 * Returns true based on a percent chance.
 *
 * @param percent The percent to have a chance of.
 */
export function percentChance(percent: number): boolean {
	return randFloat(0, 100) < percent;
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
	return randFloat(lowerLimit, upperLimit);
}
