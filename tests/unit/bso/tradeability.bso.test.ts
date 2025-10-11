import { isSuperUntradeable } from '@/lib/bso/bsoUtil.js';
import { veteranCapeSrc } from '@/lib/bso/buyables/veteranCapeBuyables.js';
import { Inventions } from '@/lib/bso/skills/invention/inventions.js';

import { Items, itemID, resolveItems } from 'oldschooljs';
import { expect, test } from 'vitest';

import { customItems } from '@/lib/customItems/util.js';
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

const shouldBeSuperUntradeable = [
	...masterCapesCL,
	...Inventions.map(i => i.item.id),
	...veteranCapeSrc.flatMap(i => i.items),
	...resolveItems([
		'TzKal Cape',
		"TzKal-Zuk's skin",
		'Jal-MejJak',
		'Infernal slayer helmet',
		'Infernal slayer helmet(i)',
		'TzKal cape',
		'Head of TzKal Zuk',
		'Infernal bulwark',
		'Infernal core',
		'Seed pack'
	])
];

test('isSuperUntradeable', () => {
	for (const item of shouldBeSuperUntradeable) {
		expect(isSuperUntradeable(item)).toEqual(true);
	}
});

test('CustomItemData should match result of isSuperUntradeable function', () => {
	for (const itemID of customItems) {
		const item = Items.getOrThrow(itemID);
		expect(item.customItemData?.isSuperUntradeable ?? false, `${item.name} should be superUntradeable`).toEqual(
			isSuperUntradeable(item)
		);
	}
});
