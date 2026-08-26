import { MathRNG, type RNGProvider } from 'node-rng';

export function randArrItem<T>(array: readonly T[], rng: RNGProvider = MathRNG): T | undefined {
	if (array.length === 0) {
		return undefined;
	}

	return array[rng.randInt(0, array.length - 1)];
}
