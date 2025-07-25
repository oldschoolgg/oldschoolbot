export function averageArr(arr: number[]) {
	return sumArr(arr) / arr.length;
}

export function getWrappedArrayItem<T>(array: T[], index: number): T {
	const wrappedIndex = ((index % array.length) + array.length) % array.length;
	return array[wrappedIndex];
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
	return arr.filter(i => i !== item);
}
