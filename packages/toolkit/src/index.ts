export * from './constants.js';
export * from './lib/GeneralBank.js';
export * from './regex.js';
export * from './structures.js';
export * from './util/math/index.js';
export * from './util/runescape.js';
export * from './util.js';

export function deepEqual(a: unknown, b: unknown): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}
