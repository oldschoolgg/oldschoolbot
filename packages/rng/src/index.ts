import { MathRNG } from './providers/math.js';
import { NodeCryptoRNG } from './providers/nodecrypto.js';

export { SeedableRNG } from './providers/seedable.js';
export * from './topLevel.js';
export type { RNGProvider } from './types.js';

export const cryptoRng = new NodeCryptoRNG();

export { MathRNG };
