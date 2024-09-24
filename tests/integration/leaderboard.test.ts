import { describe, test } from 'vitest';

import { leaderboardCommand } from '../../src/mahoji/commands/leaderboard';
import { kcGains } from '../../src/mahoji/commands/tools';
import { createTestUser } from './util';

describe('Leaderboard', async () => {
	test('KC Leaderboard', async () => {
		const user = await createTestUser();
		await user.runCommand(leaderboardCommand, {
			kc: {
				monster: 'man'
			}
		});
	});

	test('kcGains Leaderboard', async () => {
		for (const bool of [true, false]) {
			await kcGains('week', 'zulrah', bool);
		}
	});
});
