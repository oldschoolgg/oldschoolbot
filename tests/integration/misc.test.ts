import { describe, test } from 'vitest';

import { minionStatsEmbed } from '../../src/lib/util/minionStatsEmbed.js';

describe('Integration Misc', () => {
	test.concurrent('minionStatsEmbed', async () => {
		await minionStatsEmbed(await mUserFetch('1111'));
	});
});
