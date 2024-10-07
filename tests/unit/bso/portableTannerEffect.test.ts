import { itemID } from 'oldschooljs/dist/util';
import { expect, test } from 'vitest';

import { Time } from 'e';
import { portableTannerEffect } from '../../../src/lib/bso/inventionEffects';
import { MaterialBank } from '../../../src/lib/invention/MaterialBank';
import { UpdateBank } from '../../../src/lib/structures/UpdateBank';
import { makeGearBank } from '../utils';

test('portableTannerEffect.test', () => {
	const bank = new UpdateBank();
	bank.itemLootBank.add(itemID('Black dragonhide'), 100);
	const gearBank = makeGearBank();
	gearBank.bank.add('Portable tanner');
	gearBank.materials.add(
		new MaterialBank({
			metallic: 233333,
			plated: 333333,
			organic: 53333
		})
	);
	portableTannerEffect({
		gearBank,
		duration: Time.Hour,
		messages: [],
		bitfield: [],
		disabledInventions: [],
		updateBank: bank
	});
	expect(bank.itemLootBank.amount('Black dragonhide')).toEqual(0);
	expect(bank.itemLootBank.amount('Black dragon leather')).toEqual(100);
	expect(bank.userStatsBankUpdates!.portable_tanner_bank!.amount('Black dragon leather')).toEqual(100);
	expect(bank.userStatsBankUpdates!.portable_tanner_bank!.amount('Black dragonhide')).toEqual(0);
	expect(bank.clientStatsBankUpdates!.portable_tanner_loot!.amount('Black dragon leather')).toEqual(100);
	expect(bank.clientStatsBankUpdates!.portable_tanner_loot!.amount('Black dragonhide')).toEqual(0);
});
