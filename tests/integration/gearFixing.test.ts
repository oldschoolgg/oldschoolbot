import deepEqual from 'deep-equal';
import { Bank } from 'oldschooljs';
import { test } from 'vitest';

import { defaultGear, Gear } from '../../src/lib/structures/Gear';
import { assert } from '../../src/lib/util';
import itemID from '../../src/lib/util/itemID';
import { createTestUser, mockClient } from './util';

test('Gear Fixing', async () => {
	await mockClient();
	const user = await createTestUser();

	const expectedRefund = new Bank().add('Twisted bow', 5).add('Dragon boots');

	const fixedGear = new Gear().raw();
	fixedGear.shield = { item: itemID('Twisted bow'), quantity: 5 };
	fixedGear.feet = { item: itemID('Dragon boots'), quantity: 1 };
	fixedGear.body = { item: itemID('Bronze platebody'), quantity: 1 };

	await user.update({
		gear_melee: fixedGear as any
	});

	const { itemsUnequippedAndRefunded } = await user.validateEquippedGear();

	assert(
		itemsUnequippedAndRefunded.equals(expectedRefund),
		`Expected ${itemsUnequippedAndRefunded} to equal ${expectedRefund}`
	);

	assert(user.bank.equals(expectedRefund), `Expected ${user.bank} to equal ${expectedRefund}`);

	assert(
		deepEqual(user.gear.melee.raw(), {
			...defaultGear,
			body: { item: itemID('Bronze platebody'), quantity: 1 }
		})
	);
});
