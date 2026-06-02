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

export * from './colors.js';
export * from './string-util.js';
