import { describe, test } from 'vitest';

import { kcGains } from '../../src/mahoji/commands/tools';

describe('Leaderboard', async () => {
	test('kcGains Leaderboard', async () => {
		for (const bool of [true, false]) {
			await kcGains('week', 'zulrah', bool);
		}
	});
});
