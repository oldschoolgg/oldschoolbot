import { Bank } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { createTestUser, mockClient } from '../util.js';

describe('User StatsBankUpdate', async () => {
	await mockClient();

	it('Should add KC', async () => {
		const user = await createTestUser();
		await user.statsBankUpdate('buy_cost_bank', new Bank().add('Coins', 1000));
		const newStats = await user.fetchStats();
		expect(newStats.buy_cost_bank).toEqual(new Bank().add('Coins', 1000).toJSON());

		await user.statsBankUpdate('buy_cost_bank', new Bank().add('Coins', 1000));
		await user.statsBankUpdate('bird_eggs_offered_bank', new Bank().add('Coins', 1000));
		const newStats2 = await user.fetchStats();
		expect(newStats2.buy_cost_bank).toEqual(new Bank().add('Coins', 2000).toJSON());
		expect(newStats2.bird_eggs_offered_bank).toEqual(new Bank().add('Coins', 1000).toJSON());
	});
});
