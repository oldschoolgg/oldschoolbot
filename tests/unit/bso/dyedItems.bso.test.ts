import { uniqueArr } from 'e';
import { expect, test } from 'vitest';

import { allMbTables } from '../../../src/lib/bsoOpenables';
import { dyedItems } from '../../../src/lib/dyedItems';
import { isSuperUntradeable } from '../../../src/lib/util';
import itemIsTradeable from '../../../src/lib/util/itemIsTradeable';

test('No duplicate dyed items', () => {
	const all = dyedItems.map(i => i.dyedVersions.map(i => i.item.id)).flat(2);
	const allUnique = uniqueArr(all);
	expect(all.length).toEqual(allUnique.length);
});

test('all dyed items should be untradeable and not in boxes', () => {
	for (const item of dyedItems.flatMap(i => i.dyedVersions.map(t => t.item))) {
		expect(itemIsTradeable(item.id)).toBe(false);
		expect(isSuperUntradeable(item.id)).toBe(true);
		expect(allMbTables.includes(item.id)).toBe(false);
	}
});
