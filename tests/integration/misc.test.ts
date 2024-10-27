import { randArrItem } from 'e';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { analyticsTick } from '../../src/lib/analytics';
import { allCollectionLogsFlat } from '../../src/lib/data/Collections';
import { chambersOfXericCL } from '../../src/lib/data/CollectionsExport';
import { fetchCLLeaderboard } from '../../src/lib/util/clLeaderboard';
import { minionStatsEmbed } from '../../src/lib/util/minionStatsEmbed';
import { createTestUser, mockClient } from './util';

describe('Integration Misc', () => {
	test('minionStatsEmbed', async () => {
		await minionStatsEmbed(await mUserFetch('1111'));
	});
	test('Analytics', async () => {
		await mockClient();
		await analyticsTick();
		expect(await global.prisma!.analytic.count()).toBeGreaterThanOrEqual(1);
	});
	test('fetchCLLeaderboard', async () => {
		const cl = randArrItem(allCollectionLogsFlat);
		for (const ironManOnly of [true, false]) {
			await fetchCLLeaderboard({
				ironmenOnly: ironManOnly,
				resultLimit: 100,
				items: cl.items,
				clName: cl.name
			});
		}
		await Promise.all([fetchCLLeaderboard]);
	});
	test('CL Leaderboard', async () => {
		const expected = [];
		const users: MUser[] = [];
		for (let i = 1; i < chambersOfXericCL.length; i++) {
			const theirBank = new Bank();
			for (let j = 0; j < i; j++) {
				theirBank.add(chambersOfXericCL[j]);
			}
			const user = await createTestUser();
			await user.addItemsToBank({ items: theirBank, collectionLog: true });
			users.push(user);
			expected.push({ id: user.id, qty: i });
		}
		expected.reverse();
		const res = await fetchCLLeaderboard({
			ironmenOnly: false,
			items: chambersOfXericCL,
			resultLimit: 100,
			clName: 'overall'
		});
		const missingUsers = expected.filter(i => !res.users.some(j => j.id === i.id));
		expect(missingUsers).toEqual([]);
		for (let i = 1; i < res.users.length; i++) {
			expect(res.users[i].qty).toBeLessThanOrEqual(res.users[i - 1].qty);
		}
	});
});
