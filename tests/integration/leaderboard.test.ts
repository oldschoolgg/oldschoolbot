import { describe, test } from 'vitest';

import { leaderboardCommand } from '../../src/mahoji/commands/leaderboard';
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

	test('KC Leaderboard Tame', async () => {
		const user = await createTestUser();
		await user.runCommand(leaderboardCommand, {
			kc: {
				monster: 'Zulrah',
				tame: true
			}
		});
	});

	test('Tames Hatched Leaderboard', async () => {
		const user = await createTestUser();
		await user.runCommand(leaderboardCommand, {
			tames_hatched: {}
		});
	});
});
