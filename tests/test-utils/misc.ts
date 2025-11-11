import { cryptoRng, type RNGProvider } from '@oldschoolgg/rng';
import { randomSnowflake } from '@oldschoolgg/util';

const idsUsed = new Set<string>();
export const handleTripFinishResults = new Map<string, any>();

export function mockedId() {
	const id = randomSnowflake(cryptoRng);
	if (idsUsed.has(id)) {
		throw new Error(`ID ${id} has already been used`);
	}
	idsUsed.add(id);
	return id;
}

export function mockSnowflake(rng: RNGProvider) {
	return rng.randInt(1, 5_000_000_000_000).toString();
}
