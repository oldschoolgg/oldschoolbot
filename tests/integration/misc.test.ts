import { describe, test } from 'vitest';

import { minionStatsEmbed } from '../../src/lib/util/minionStatsEmbed';

describe('Integration Misc', () => {
	test('minionStatsEmbed', async () => {
		await minionStatsEmbed(await mUserFetch('1111'));
	});
});
