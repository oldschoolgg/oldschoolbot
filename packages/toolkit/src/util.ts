// External

export { detailedDiff as deepObjectDiff } from 'deep-object-diff';
export { default as deepMerge } from 'deepmerge';
export { default as deepEqual } from 'fast-deep-equal';

export * from './lib/Store.js';
export * from './string-util.js';
export * from './types.js';
export * from './util/array.js';
export * from './util/chance.js';
export * from './util/chanceTemporary.js';
export * from './util/datetime.js';
export * from './util/markdown.js';
export * from './util/misc.js';
export * from './util/typeChecking.js';

export function clamp(num: number, min: number, max: number) {
	return Math.min(Math.max(num, min), max);
}

export function objectValues<T>(obj: Record<string, T>): T[] {
	return Object.keys(obj).map(key => obj[key]);
}

export function objectKeys<T>(obj: Record<T, unknown>): T[] {
	return Object.keys(obj) as T[];
}

export { clone as deepClone } from 'remeda';
