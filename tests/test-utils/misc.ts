import { randomSnowflake } from '@oldschoolgg/util';
import type { RNGProvider } from 'node-rng';
import { cryptoRng } from 'node-rng/crypto';
import { Bank, ItemGroups, Items } from 'oldschooljs';

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
	return randomSnowflake(rng);
}

export const bankWithAllItems = new Bank();
for (const item of Items.keys()) {
	if (ItemGroups.allUnobtainableItems.includes(item)) continue;
	bankWithAllItems.add(item, 100_000);
}
bankWithAllItems.freeze();
