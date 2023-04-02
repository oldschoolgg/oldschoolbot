import { describe, expect, test } from 'vitest';

import { analyticsTick } from '../../src/lib/analytics';
import { prisma } from '../../src/lib/settings/prisma';
import { minionStatsEmbed } from '../../src/lib/util/minionStatsEmbed';
import { mockClient } from './util';

describe('Integration Misc', () => {
	test('minionStatsEmbed', async () => {
		await minionStatsEmbed(await mUserFetch('1111'));
	});
	test('Analytics', async () => {
		await mockClient();
		await analyticsTick();
		expect(await prisma.analytic.count()).toBeGreaterThanOrEqual(1);
	});
});
