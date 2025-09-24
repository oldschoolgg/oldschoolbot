import { Items, itemID } from 'oldschooljs';
import { expect, test } from 'vitest';

import { isSuperUntradeable } from '@/lib/bso/bsoUtil.js';
import { masterCapesCL } from '@/lib/data/CollectionsExport.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';

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
	expect(isSuperUntradeable(Items.getOrThrow('TzKal Cape'))).toEqual(true);
	expect(isSuperUntradeable(Items.getOrThrow("TzKal-Zuk's skin"))).toEqual(true);
	expect(isSuperUntradeable(Items.getOrThrow('Jal-MejJak'))).toEqual(true);
	expect(isSuperUntradeable(Items.getOrThrow('Infernal slayer helmet'))).toEqual(true);
	expect(isSuperUntradeable(Items.getOrThrow('Infernal slayer helmet(i)'))).toEqual(true);
	expect(isSuperUntradeable(Items.getOrThrow('TzKal cape'))).toEqual(true);
	expect(isSuperUntradeable(Items.getOrThrow('Head of TzKal Zuk'))).toEqual(true);
	expect(isSuperUntradeable(Items.getOrThrow('Infernal bulwark'))).toEqual(true);
	expect(isSuperUntradeable(Items.getOrThrow('Infernal core'))).toEqual(true);
	expect(isSuperUntradeable(Items.getOrThrow('Seed pack'))).toEqual(true);

	for (const cape of masterCapesCL) {
		expect(isSuperUntradeable(cape)).toEqual(true);
	}
});
