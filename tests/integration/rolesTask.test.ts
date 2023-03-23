import { describe, expect, test } from 'vitest';

import { runRolesTask } from '../../src/lib/rolesTask';

describe('Roles Task', async () => {
	test('Should not throw', async () => {
		expect(await runRolesTask()).toBeTruthy();
	});
});
