import type { RNGProvider } from '@oldschoolgg/rng';
import { cryptoRng } from '@oldschoolgg/rng/crypto';
import { randomSnowflake } from '@oldschoolgg/util';
import { Bank, Items } from 'oldschooljs';

import { allUnobtainableItems } from '../../packages/oldschooljs/dist/esm/item-groups/unobtainable.mjs';

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

export const bankWithAllItems = new Bank();
for (const item of Items.keys()) {
	if (allUnobtainableItems.includes(item)) continue;
	bankWithAllItems.add(item, 100_000);
}
bankWithAllItems.freeze();
