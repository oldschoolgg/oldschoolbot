import { Bank, EMonster } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { UpdateBank } from '../../src/lib/structures/UpdateBank';
import { createTestUser } from './util';

describe('UpdateBank', async () => {
	it('should add kc', async () => {
		const user = await createTestUser();
		const updateBank = new UpdateBank();
		updateBank.kcBank.add(EMonster.MAN, 69);
		await updateBank.transact(user);
		const newKC = await user.getKC(EMonster.MAN);
		expect(newKC).toBe(69);

		// Repeat
		await updateBank.transact(user);
		expect(await user.getKC(EMonster.MAN)).toBe(69 * 2);
	});

	it('should remove charges', async () => {
		const user = await createTestUser();
		await user.update({
			tum_shadow_charges: 1000,
			tentacle_charges: 1000,
			sang_charges: 1000
		});
		expect(user.user.tum_shadow_charges).toBe(1000);
		expect(user.user.tentacle_charges).toBe(1000);
		const updateBank = new UpdateBank();
		updateBank.chargeBank.add('tum_shadow_charges', 500);
		updateBank.chargeBank.add('tentacle_charges', 500);
		await updateBank.transact(user);
		expect(user.user.tum_shadow_charges).toBe(500);
		expect(user.user.tentacle_charges).toBe(500);
		expect(user.user.sang_charges).toBe(1000);
	});

	it('should add xp', async () => {
		const user = await createTestUser();
		await user.update({});
		const updateBank = new UpdateBank();
		updateBank.xpBank.add('slayer', 555);
		updateBank.xpBank.add('attack', 123);
		updateBank.xpBank.add('attack', 123, { source: 'AerialFishing' });
		updateBank.xpBank.add('strength', 123);
		await updateBank.transact(user);
		await user.sync();

		expect(user.skillsAsXP.slayer).toBe(555);
		expect(user.skillsAsXP.attack).toBe(123 * 2);
		expect(user.skillsAsXP.strength).toBe(123);
	});

	it('should add/remove items', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Coal', 100) });
		const updateBank = new UpdateBank();
		updateBank.itemCostBank.add('Coal', 50);
		updateBank.itemLootBank.add('Egg', 50);
		await updateBank.transact(user);
		await user.sync();

		expect(user.bank.amount('Coal')).toBe(50);
		expect(user.bank.amount('Egg')).toBe(50);
	});
});
