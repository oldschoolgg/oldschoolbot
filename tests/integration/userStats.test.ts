import { describe, expect, test } from 'vitest';

import { userStatsUpdate } from '../../src/mahoji/mahojiSettings';
import { createTestUser, mockClient } from './util';

describe('User Stats', async () => {
	await mockClient();

	test('Should return nothing', async () => {
		const user = await createTestUser();
		const userID = user.id;

		expect(await user.fetchStats({})).toEqual({ user_id: BigInt(userID) });
		const result = await userStatsUpdate(
			userID,
			{
				ash_sanctifier_prayer_xp: {
					increment: 100
				}
			},
			{}
		);
		expect(result).toEqual({ user_id: BigInt(userID) });
		const result2 = await userStatsUpdate(
			userID,
			{
				ash_sanctifier_prayer_xp: {
					increment: 100
				}
			},
			{}
		);
		expect(result2).toEqual({ user_id: BigInt(userID) });
		const stats = await user.fetchStats({ ash_sanctifier_prayer_xp: true });
		expect(stats.ash_sanctifier_prayer_xp).toEqual(BigInt(200));
		expect(Object.keys(stats).length).toEqual(1);
	});
});
