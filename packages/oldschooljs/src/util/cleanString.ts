/**
 * Removes all whitespace, and uppercases it. Used for comparisons.
 * @param str The string to clean.
 */
export function cleanString(str: string): string {
	return str.replace(/\s/g, '').toUpperCase();
}
