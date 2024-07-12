import deepEqual from 'fast-deep-equal';
import { Bank } from 'oldschooljs';
import { describe, test } from 'vitest';

import { Gear, defaultGear } from '../../src/lib/structures/Gear';
import { assert } from '../../src/lib/util';
import itemID from '../../src/lib/util/itemID';
import { createTestUser, mockClient } from './util';

describe('Gear Fixing', async () => {
	test('Basic tests', async () => {
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
	test('Multiple 2h + 1h equipped tests', async () => {
		await mockClient();
		const user = await createTestUser();

		const expectedRefund = new Bank().add('Bronze dagger').add('Bronze kiteshield');

		const fixedGear = new Gear().raw();
		fixedGear['2h'] = { item: itemID('Bronze 2h sword'), quantity: 1 };
		fixedGear.shield = { item: itemID('Bronze kiteshield'), quantity: 1 };
		fixedGear.weapon = { item: itemID('Bronze dagger'), quantity: 1 };

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
				'2h': { item: itemID('Bronze 2h sword'), quantity: 1 }
			})
		);
	});
});
