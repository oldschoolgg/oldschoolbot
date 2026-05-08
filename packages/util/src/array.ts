/**
 * Returns a copy of an array with duplicates removed.
 *
 * @param arr The array to copy and remove duplicates from.
 */
export function uniqueArr<T>(arr: readonly T[]): T[] {
	return [...new Set(arr)];
}

/**
 * Splits up an array into chunks
 * @param array The array to chunk up
 * @param chunkSize The size of each individual chunk
 */
export function chunkArr<T>(array: readonly T[], chunkSize: number): T[][] {
	if (chunkSize < 1) throw new RangeError('chunkSize must be 1 or greater.');
	if (!Number.isInteger(chunkSize)) throw new TypeError('chunkSize must be an integer.');
	const clone: T[] = array.slice();
	const chunks: T[][] = [];
	while (clone.length) chunks.push(clone.splice(0, chunkSize));
	return chunks;
}

/**
 * Returns the sum of an array of numbers.
 *
 * @param arr The array of numbers to sum.
 */
export function sumArr(arr: readonly number[]): number {
	return arr.reduce((a, b) => a + b, 0);
}
