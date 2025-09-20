import { expect, test } from 'vitest';

import { killCommand } from '../../src/mahoji/commands/kill.js';
import { createTestUser } from './util.js';

test('killSimulator.test', async () => {
	const user = await createTestUser();
	expect(async () => await user.runCommand(killCommand, { name: 'man', quantity: 100 })).to.not.throw();
});
