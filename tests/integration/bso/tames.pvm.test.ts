import { Bank, EMonster } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { createTestUser, mockClient } from '../util.js';
import { BSOTestUtil } from './bsoTestUtil.js';

describe('Tames', async () => {
	await mockClient();

	it('Should add KC', async () => {
		const user = await createTestUser();
		await BSOTestUtil.giveIgneTame(user);

		// Should fail because no food
		const fail1 = await BSOTestUtil.tamePVMTrip(user, EMonster.ALCHEMICAL_HYDRA);
		expect(fail1.activity).toBeNull();
		expect(fail1.commandResult).toContain("You don't have enough Raw food");

		// Should fail2 because no antivenom
		await user.addItemsToBank({ items: new Bank().add('Raw shark', 100_000) });
		const fail2 = await BSOTestUtil.tamePVMTrip(user, EMonster.ALCHEMICAL_HYDRA);
		expect(fail2.activity).toBeNull();
		expect(fail2.commandResult).toContain("You don't have the required items");

		// Should succeed
		await user.addItemsToBank({ items: new Bank().add('Anti-venom+(4)', 100_000) });
		const success = await BSOTestUtil.tamePVMTrip(user, EMonster.ALCHEMICAL_HYDRA);
		expect(success.activity?.data).not.toBeNull();
		expect(success.commandResult).toContain('is now killing');
		expect(user.bank.amount('Anti-venom+(4)')).toBeLessThan(100_000);
		expect(user.bank.amount('Raw shark')).toBeLessThan(100_000);

		const newTame = await user.fetchActiveTame();
		expect(newTame.tame?.totalLoot.length).toBeGreaterThan(0);
	});
});
