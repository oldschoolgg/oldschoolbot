/**
 * Rounds a number to a given precision.
 *
 * @param value The number to be rounded.
 * @param precision The precision of the rounding.
 */
export function round(value: number, precision = 1): number {
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
}

export function toKMB(number: number): string {
	if (number > 999_999_999 || number < -999_999_999) {
		return `${round(number / 1_000_000_000)}b`;
	} else if (number > 999_999 || number < -999_999) {
		return `${round(number / 1_000_000)}m`;
	} else if (number > 999 || number < -999) {
		return `${round(number / 1000)}k`;
	}
	return round(number).toString();
}

export function fromKMB(number: string): number {
	number = number.toLowerCase().replace(/,/g, '');
	const [numberBefore, numberAfter] = number.split(/[.kmb]/g);

	let newNum = numberBefore;
	if (number.includes('b')) {
		newNum += numberAfter + '0'.repeat(9).slice(numberAfter.length);
	} else if (number.includes('m')) {
		newNum += numberAfter + '0'.repeat(6).slice(numberAfter.length);
	} else if (number.includes('k')) {
		newNum += numberAfter + '0'.repeat(3).slice(numberAfter.length);
	}

	return Number.parseInt(newNum);
}

/**
 * Shows what percentage a value is of a total value, for example calculating what percentage of 20 is 5? (25%)
 * @param partialValue The partial value of the total number, that you want to know what its percentage of the total is.
 * @param totalValue The total value, that the partial value is a part of.
 */
export function calcWhatPercent(partialValue: number, totalValue: number): number {
	return (100 * partialValue) / totalValue;
}

/**
 * Calculates what a X% of a total number is, for example calculating what is 20% of 100
 * @param percent The percentage (%) you want to calculate.
 * @param valueToCalc The total number that you want to get the percentage of.
 */
export function calcPercentOfNum(percent: number, valueToCalc: number): number {
	return (percent * valueToCalc) / 100;
}

/**
 * Reduces a number by a percentage of itself.
 * @param value, The number to be reduced.
 * @param percent The percent you want the value to be reduced by.
 */
export function reduceNumByPercent(value: number, percent: number): number {
	if (percent <= 0) return value;
	return value - value * (percent / 100);
}

/**
 * Increases a number by a percentage of itself.
 * @param value, The number to be increased.
 * @param percent The percent you want the value to be increased by.
 */
export function increaseNumByPercent(value: number, percent: number): number {
	if (percent <= 0) return value;
	return value + value * (percent / 100);
}

/**
 * Picks a random item from an array.
 * @param array The array to pick from.
 */
export function randArrItem<T>(array: readonly T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Splits up an array into chunks
 * @param array The array to chunk up
 * @param chunkSize The size of each individual chunk
 */
export function chunk<T>(array: readonly T[], chunkSize: number): T[][] {
	if (chunkSize < 1) throw new RangeError('chunkSize must be 1 or greater.');
	if (!Number.isInteger(chunkSize)) throw new TypeError('chunkSize must be an integer.');
	const clone: T[] = array.slice();
	const chunks: T[][] = [];
	while (clone.length) chunks.push(clone.splice(0, chunkSize));
	return chunks;
}

/**
 * Returns a copy of an array with duplicates removed.
 *
 * @param arr The array to copy and remove duplicates from.
 */
export function uniqueArr<T>(arr: readonly T[]): T[] {
	return [...new Set(arr)];
}

/**
 * Returns the sum of an array of numbers.
 *
 * @param arr The array of numbers to sum.
 */
export function sumArr(arr: readonly number[]) {
	return arr.reduce((a, b) => a + b, 0);
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

/**
 *
 * @param arr The array to partition
 * @param filter The filter by which to partition the array
 */
export function partition<T>(arr: T[], filter: (item: T) => boolean): [T[], T[]] {
	const firstArray: T[] = [];
	const secondArray: T[] = [];
	for (const item of arr) {
		(filter(item) ? firstArray : secondArray).push(item);
	}
	return [firstArray, secondArray];
}

export function removeFromArr<T>(arr: T[] | readonly T[], item: T) {
	return arr.filter((i) => i !== item);
}

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

export enum Time {
	Millisecond = 1,
	Second = 1000,
	Minute = 1000 * 60,
	Hour = 1000 * 60 * 60,
	Day = 1000 * 60 * 60 * 24,
	Month = 1000 * 60 * 60 * 24 * 30,
	Year = 1000 * 60 * 60 * 24 * 365
}
