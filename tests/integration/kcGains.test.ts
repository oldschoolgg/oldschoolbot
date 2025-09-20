import { describe, expect, it } from 'vitest';

import { kcGains } from '../../src/mahoji/commands/tools.js';

describe('KC Gains leaderboard', () => {
	it('should not allow sql injection', async () => {
		expect(await kcGains(';DELETE FROM users;', 'man', false)).toEqual('Invalid time interval.');
	});
});
