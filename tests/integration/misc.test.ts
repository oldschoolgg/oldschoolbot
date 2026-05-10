import { describe, test } from 'vitest';

import { minionStatsEmbed } from '../../src/lib/util/minionStatsEmbed.js';

describe('Integration Misc', () => {
	test('minionStatsEmbed', async () => {
		await minionStatsEmbed({ user: await mUserFetch('829398443821891634') });
	});
});
