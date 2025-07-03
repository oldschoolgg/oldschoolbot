import { describe, expect, test } from 'vitest';

import { simulateCommand } from '../../../src/mahoji/commands/simulate';
import { createTestUser, mockClient } from '../util';

describe('Simulate Miscellania', async () => {
	await mockClient();

	test('returns image', async () => {
		const user = await createTestUser();
		const result: any = await user.runCommand(simulateCommand, {
			miscellania: {
				days: 3,
				approval: 80,
				ten_workers: 'herbs',
				five_workers: 'mining'
			}
		});
		expect(result.files?.length).toBe(1);
	});
});
