import { describe, test } from 'vitest';

import { dataPoints } from '../../src/mahoji/lib/abstracted_commands/statCommand';
import { createTestUser, mockClient } from './util';

describe('Datapoints', async () => {
	await mockClient();

	test('Data points', async () => {
		const user = await createTestUser();
		const stats = await global.prisma!.userStats.upsert({
			where: { user_id: BigInt(user.id) },
			create: { user_id: BigInt(user.id) },
			update: {}
		});
		for (const a of dataPoints) {
			try {
				const res = await a.run(user, stats!);
				if (a.name === 'Expected Skilling Pets') {
					expect(typeof res).toBe('string');
					expect(res).toContain('Expected Skilling Pets');
				}
			} catch (err) {
				throw new Error(`Error running ${a.name}: ${err}`);
			}
		}
	});
});
