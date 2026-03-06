import { defaultGearSetup } from '@oldschoolgg/gear';
import { Bank, itemID } from 'oldschooljs';
import { isDeepEqual } from 'remeda';
import { assert, describe, test } from 'vitest';

import { validateEquippedGear } from '@/lib/user/userUtils.js';
import { Gear } from '../../../src/lib/structures/Gear.js';
import { createTestUser, mockClient } from '../util.js';

describe('Gear Fixing', async () => {
	test('Basic tests', async () => {
		await mockClient();
		const user = await createTestUser();

		const expectedRefund = new Bank().add('Twisted bow', 5).add('Dragon boots');

		const fixedGear = { ...defaultGearSetup };
		fixedGear.shield = { item: itemID('Twisted bow'), quantity: 5 };
		fixedGear.feet = { item: itemID('Dragon boots'), quantity: 1 };
		fixedGear.body = { item: itemID('Bronze platebody'), quantity: 1 };

		await user.updateGear([{ setup: 'melee', gear: fixedGear }]);

		const { itemsUnequippedAndRefunded } = await validateEquippedGear(user);

		assert(
			itemsUnequippedAndRefunded.equals(expectedRefund),
			`Expected ${itemsUnequippedAndRefunded} to equal ${expectedRefund}`
		);

		assert(user.bank.equals(expectedRefund), `Expected ${user.bank} to equal ${expectedRefund}`);

		assert(
			isDeepEqual(user.gear.melee.raw(), {
				...defaultGearSetup,
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

		await user.updateGear([{ setup: 'melee', gear: fixedGear }]);

		const { itemsUnequippedAndRefunded } = await validateEquippedGear(user);

		assert(
			itemsUnequippedAndRefunded.equals(expectedRefund),
			`Expected ${itemsUnequippedAndRefunded} to equal ${expectedRefund}`
		);

		assert(user.bank.equals(expectedRefund), `Expected ${user.bank} to equal ${expectedRefund}`);

		assert(
			isDeepEqual(user.gear.melee.raw(), {
				...defaultGearSetup,
				'2h': { item: itemID('Bronze 2h sword'), quantity: 1 }
			})
		);
	});
});
