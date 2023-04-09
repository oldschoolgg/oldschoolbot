import { describe, expect, test } from 'vitest';

import { leaguesCommand } from '../../src/mahoji/commands/leagues';
import { createTestUser } from './util';

describe('Leagues Command', async () => {
	const user = await createTestUser();

	test('Lose dice', async () => {
		const result = await user.runCommand(leaguesCommand, {});
		expect(result).toEqual('Invalid command.');
	});
});
