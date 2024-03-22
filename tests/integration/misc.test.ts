import { UserEvent } from '@prisma/client';
import { randArrItem } from 'e';
import { describe, expect, test } from 'vitest';

import { analyticsTick } from '../../src/lib/analytics';
import { allCollectionLogsFlat } from '../../src/lib/data/Collections';
import { fetchCLLeaderboard } from '../../src/lib/util/clLeaderboard';
import { minionStatsEmbed } from '../../src/lib/util/minionStatsEmbed';
import { mockClient } from './util';

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
		for (const ironManOnly of [true, false]) {
			for (const method of ['cl_array', 'raw_cl'] as const) {
				for (const userEvents of [
					[
						{
							id: 'asdf',
							date: new Date(),
							user_id: '123',
							type: 'CLCompletion',
							skill: null,
							collection_log_name: 'giant mole'
						} as UserEvent
					],
					null
				]) {
					await fetchCLLeaderboard({
						ironmenOnly: ironManOnly,
						method,
						userEvents,
						resultLimit: 100,
						items: randArrItem(allCollectionLogsFlat).items
					});
				}
			}
		}
		await Promise.all([fetchCLLeaderboard]);
	});
});
