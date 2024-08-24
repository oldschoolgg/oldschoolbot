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
});
