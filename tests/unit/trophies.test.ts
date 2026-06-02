import { Items } from 'oldschooljs';
import { expect, test } from 'vitest';

import { allTrophyItems } from '../../src/lib/data/itemAliases.js';
import itemIsTradeable from '../../src/lib/util/itemIsTradeable.js';

test('trophies', async () => {
	expect(Items.getOrThrow('BSO dragon trophy')).toMatchObject({ id: 24_372 });
	expect(Items.getOrThrow('BSO bronze trophy')).toMatchObject({ id: 24_384 });

	expect(Items.getOrThrow('Comp. dragon trophy')).toMatchObject({ id: 25_042 });
	expect(Items.getOrThrow('Comp. bronze trophy')).toMatchObject({ id: 25_054 });

	expect(Items.getOrThrow('Placeholder dragon trophy')).toMatchObject({ id: 26_515 });
	expect(Items.getOrThrow('Placeholder bronze trophy')).toMatchObject({ id: 26_503 });

	for (const trophy of allTrophyItems) {
		expect(itemIsTradeable(trophy)).toEqual(false);
	}
});
