import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { createTestUser, mockClient } from './util.js';

describe('User Stats', async () => {
	await mockClient();

	test('Stats Update', async () => {
		const user = await createTestUser();

		expect((await user.fetchStats()).ash_sanctifier_prayer_xp).toEqual(0n);
		await user.statsUpdate({
			ash_sanctifier_prayer_xp: {
				increment: 100
			}
		});
		expect((await user.fetchStats()).ash_sanctifier_prayer_xp).toEqual(100n);
	});

	test('Stats Bank Update', async () => {
		const user = await createTestUser();
		const b = new Bank().add('Coins', 100).freeze();
		await expect(user.fetchStats()).resolves.toMatchObject({ sacrificed_bank: {} });
		await user.statsBankUpdate('sacrificed_bank', b);
		await expect(user.fetchStats()).resolves.toMatchObject({ sacrificed_bank: b.toJSON() });
		const mStats = await user.fetchMStats();
		expect(mStats.sacrificedBank.equals(b)).toEqual(true);
	});
});
