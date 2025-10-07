import { portableTannerEffect } from '@/lib/bso/skills/invention/effects/portableTannerEffect.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { Time } from '@oldschoolgg/toolkit';
import { itemID } from 'oldschooljs';
import { expect, test } from 'vitest';

import { UpdateBank } from '@/lib/structures/UpdateBank.js';
import { makeGearBank } from '../utils.js';

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
