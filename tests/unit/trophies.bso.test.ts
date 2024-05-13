import { expect, test } from 'vitest';

import { allMbTables } from '../../src/lib/bsoOpenables';
import { allTrophyItems } from '../../src/lib/data/trophies';
import getOSItem from '../../src/lib/util/getOSItem';
import itemIsTradeable from '../../src/lib/util/itemIsTradeable';
import { resolveOSItems } from '../../src/lib/util/resolveItems';

test('trophies', async () => {
	expect(getOSItem('BSO dragon trophy')).toMatchObject({ id: 24_372 });
	expect(getOSItem('BSO bronze trophy')).toMatchObject({ id: 24_384 });

	expect(getOSItem('Comp. dragon trophy')).toMatchObject({ id: 25_042 });
	expect(getOSItem('Comp. bronze trophy')).toMatchObject({ id: 25_054 });

	expect(getOSItem('Placeholder dragon trophy')).toMatchObject({ id: 26_515 });
	expect(getOSItem('Placeholder bronze trophy')).toMatchObject({ id: 26_503 });

	for (const trophy of resolveOSItems(allTrophyItems)) {
		expect(itemIsTradeable(trophy.id)).toEqual(false);
		expect(trophy.customItemData?.isSuperUntradeable).toEqual(true);
		expect(allMbTables.includes(trophy.id)).toEqual(false);
	}
});
