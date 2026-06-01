import { randArrItem } from 'node-rng';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { allCollectionLogsFlat } from '../../src/lib/data/Collections.js';
import { chambersOfXericCL } from '../../src/lib/data/CollectionsExport.js';
import { fetchCLLeaderboard } from '../../src/lib/util/clLeaderboard.js';
import { UserEventType } from '../../src/prisma/main/enums.js';
import { createTestUser } from './util.js';

describe('CL Leaderboard', () => {
	test('fetchCLLeaderboard', async () => {
		const cl = randArrItem(allCollectionLogsFlat)!;
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

	test('account filters apply to CL completion event users', async () => {
		const items = new Set(chambersOfXericCL.slice(0, 2));
		const cl_array = Array.from(items);
		const main = await createTestUser(undefined, { cl_array });
		const iron = await createTestUser(undefined, { cl_array, minion_ironman: true });

		await prisma.userEvent.createMany({
			data: [main, iron].map(user => ({
				user_id: user.id,
				type: UserEventType.CLCompletion,
				collection_log_name: 'overall'
			}))
		});

		const ironsOnly = await fetchCLLeaderboard({
			ironmenOnly: true,
			accountFilter: 'ironmen',
			items,
			resultLimit: 100,
			clName: 'overall'
		});
		expect(ironsOnly.users.some(user => user.id === iron.id)).toBe(true);
		expect(ironsOnly.users.some(user => user.id === main.id)).toBe(false);

		const mainsOnly = await fetchCLLeaderboard({
			ironmenOnly: false,
			accountFilter: 'mains',
			items,
			resultLimit: 100,
			clName: 'overall'
		});
		expect(mainsOnly.users.some(user => user.id === main.id)).toBe(true);
		expect(mainsOnly.users.some(user => user.id === iron.id)).toBe(false);
	});

	test.skip('CL Leaderboard', async () => {
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
			items: new Set(chambersOfXericCL),
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
