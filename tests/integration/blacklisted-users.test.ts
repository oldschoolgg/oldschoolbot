import { expect, test } from 'vitest';

import { BLACKLISTED_USERS } from '@/lib/cache.js';
import { mockUser } from './util.js';

test('Blacklisted Users', async () => {
	const user = await mockUser({ maxed: true });

	await user.runCommand('m');
	BLACKLISTED_USERS.add(user.id);
	expect(await user.runCommand('m')).toMatchObject({ content: 'You are blacklisted.' });
});
