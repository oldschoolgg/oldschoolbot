import { uniqueArr } from '@oldschoolgg/toolkit';
import { expect, test } from 'vitest';

import { isSuperUntradeable } from '@/lib/bso/bsoUtil.js';
import { dyedItems } from '@/lib/bso/dyedItems.js';
import { combinedTmbUmbEmbTables } from '@/lib/bso/openables/bsoOpenables.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';

test('No duplicate dyed items', () => {
	const all = dyedItems.map(i => i.dyedVersions.map(i => i.item.id)).flat(2);
	const allUnique = uniqueArr(all);
	expect(all.length).toEqual(allUnique.length);
});

test('all dyed items should be untradeable and not in boxes', () => {
	for (const item of dyedItems.flatMap(i => i.dyedVersions.map(t => t.item))) {
		expect(itemIsTradeable(item.id)).toBe(false);
		expect(isSuperUntradeable(item.id)).toBe(true);
		expect(combinedTmbUmbEmbTables.includes(item.id)).toBe(false);
	}
});
