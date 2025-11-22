// External
export { default as deepMerge } from 'deepmerge';

export * from './lib/Store.js';
export * from './types.js';
export * from './util/array.js';
export * from './util/chance.js';
export * from './util/datetime.js';
export * from './util/markdown.js';
export * from './util/misc.js';
export * from './util/typeChecking.js';

import { detailedDiff } from 'deep-object-diff';
export { detailedDiff as deepObjectDiff };

export { default as deepEqual } from 'fast-deep-equal';

export * from './string-util.js';

export function isValidHexColor(hex: string): boolean {
	const isValid = hex.length === 7 && /^#([0-9A-F]{3}){1,2}$/i.test(hex);
	return isValid;
}

export function hexToDecimal(hex: string): number {
	let h = hex.trim().replace(/^#/, '').toLowerCase();
	if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
	if (!isValidHexColor(h)) throw new Error('Invalid hex');
	return parseInt(h, 16);
}
