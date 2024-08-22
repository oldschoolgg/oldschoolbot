import { itemID } from 'oldschooljs/dist/util';
import { expect, test } from 'vitest';

import { masterCapesCL } from '../../../src/lib/data/CollectionsExport';
import { isSuperUntradeable } from '../../../src/lib/util';
import getOSItem from '../../../src/lib/util/getOSItem';
import itemIsTradeable from '../../../src/lib/util/itemIsTradeable';

test('santa hats should be tradeable', () => {
	expect(itemIsTradeable(itemID('Black santa hat'))).toEqual(true);
	expect(itemIsTradeable(itemID('Inverted santa hat'))).toEqual(true);
	expect(itemIsTradeable(itemID('Santa hat'))).toEqual(true);
	expect(itemIsTradeable(itemID('Coal'))).toEqual(true);
	expect(itemIsTradeable(itemID('Golden partyhat'))).toEqual(true);
	expect(itemIsTradeable(itemID('Rune pouch'))).toEqual(true);
	expect(itemIsTradeable(itemID('Agility cape'))).toEqual(true);
	expect(itemIsTradeable(itemID('Achievement diary cape'))).toEqual(true);
	expect(itemIsTradeable(itemID('Crafting master cape'))).toEqual(false);
	expect(itemIsTradeable(itemID('Infernal bulwark'))).toEqual(false);
});

test('isSuperUntradeable', () => {
	expect(isSuperUntradeable(getOSItem('TzKal Cape'))).toEqual(true);
	expect(isSuperUntradeable(getOSItem("TzKal-Zuk's skin"))).toEqual(true);
	expect(isSuperUntradeable(getOSItem('Jal-MejJak'))).toEqual(true);
	expect(isSuperUntradeable(getOSItem('Infernal slayer helmet'))).toEqual(true);
	expect(isSuperUntradeable(getOSItem('Infernal slayer helmet(i)'))).toEqual(true);
	expect(isSuperUntradeable(getOSItem('TzKal cape'))).toEqual(true);
	expect(isSuperUntradeable(getOSItem('Head of TzKal Zuk'))).toEqual(true);
	expect(isSuperUntradeable(getOSItem('Infernal bulwark'))).toEqual(true);
	expect(isSuperUntradeable(getOSItem('Infernal core'))).toEqual(true);
	expect(isSuperUntradeable(getOSItem('Seed pack'))).toEqual(true);

	for (const cape of masterCapesCL) {
		expect(isSuperUntradeable(cape)).toEqual(true);
	}
});
