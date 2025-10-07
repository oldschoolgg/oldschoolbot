import { describe, test } from 'vitest';

import { leaderboardCommand } from '../../src/mahoji/commands/leaderboard.js';
import { kcGains } from '../../src/mahoji/commands/tools.js';
import { createTestUser } from './util.js';

describe('Leaderboard', async () => {
	test('kcGains Leaderboard', async () => {
		for (const bool of [true, false]) {
			await kcGains('week', 'zulrah', bool);
		}
	});

	test('Minigames Leaderboard (ironmen_only true)', async () => {
		const user = await createTestUser();
		await user.runCommand(leaderboardCommand, {
			minigames: {
				minigame: 'Tithe farm',
				ironmen_only: true
			}
		});
	});

	test('Minigames Leaderboard (ironmen_only false)', async () => {
		const user = await createTestUser();
		await user.runCommand(leaderboardCommand, {
			minigames: {
				minigame: 'Tithe farm',
				ironmen_only: false
			}
		});
	});
});
