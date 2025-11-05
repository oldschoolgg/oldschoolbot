import { cryptoRng, type RNGProvider } from '@oldschoolgg/rng';

const idsUsed = new Set<string>();

export function mockedId() {
	const id = cryptoRng.randInt(1, 5_000_000_000_000).toString();
	if (idsUsed.has(id)) {
		throw new Error(`ID ${id} has already been used`);
	}
	idsUsed.add(id);
	return id;
}

export function mockSnowflake(rng: RNGProvider) {
	return rng.randInt(1, 5_000_000_000_000).toString();
}
