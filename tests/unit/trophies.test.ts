import { expect, test } from 'vitest';

import { allTrophyItems } from '../../src/lib/data/itemAliases';
import getOSItem from '../../src/lib/util/getOSItem';
import itemIsTradeable from '../../src/lib/util/itemIsTradeable';

test('trophies', async () => {
	expect(getOSItem('BSO dragon trophy')).toMatchObject({ id: 24_372 });
	expect(getOSItem('BSO bronze trophy')).toMatchObject({ id: 24_384 });

	expect(getOSItem('Comp. dragon trophy')).toMatchObject({ id: 25_042 });
	expect(getOSItem('Comp. bronze trophy')).toMatchObject({ id: 25_054 });

	expect(getOSItem('Placeholder dragon trophy')).toMatchObject({ id: 26_515 });
	expect(getOSItem('Placeholder bronze trophy')).toMatchObject({ id: 26_503 });

	for (const trophy of allTrophyItems) {
		expect(itemIsTradeable(trophy)).toEqual(false);
	}
});
