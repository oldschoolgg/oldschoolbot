import { NodeCryptoRNG } from './providers/nodecrypto.js';
import type { RNGProvider } from './types.js';

export const cryptoRng: RNGProvider = new NodeCryptoRNG();
