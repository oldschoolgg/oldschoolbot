import { randomBytes, randomInt } from 'node:crypto';

import type { RNGProvider } from '../types.js';

export class NodeCryptoRNG implements RNGProvider {
	roll(max: number): boolean {
		return this.randInt(1, max) === 1;
	}

	randInt(min: number, max: number): number {
		return randomInt(min, max + 1);
	}

	randFloat(min: number, max: number): number {
		return min + (max - min) * this.rand();
	}

	rand(): number {
		const buf = randomBytes(6); // 48 bits
		const int = buf.readUIntBE(0, 6);
		return int / 0x1000000000000;
	}

	shuffle<T>(array: T[]): T[] {
		const arr = [...array];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = this.randInt(0, i);
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	pick<T>(array: T[]): T {
		return array[this.randInt(0, array.length - 1)];
	}

	percentChance(percent: number): boolean {
		return this.rand() < percent / 100;
	}
}
