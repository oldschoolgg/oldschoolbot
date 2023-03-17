import { uniqueArr } from 'e';
import { describe, expect, test } from 'vitest';

import { dyedItems } from '../../src/lib/dyedItems';

describe('Dyed Items', () => {
	test('', () => {
		let all = dyedItems.map(i => i.dyedVersions.map(i => i.item.id)).flat(2);
		let allUnique = uniqueArr(all);
		expect(all.length).toEqual(allUnique.length);
	});
});
