import { describe, test } from 'vitest';

import { prisma } from '../../src/lib/settings/prisma';
import { dataPoints } from '../../src/mahoji/lib/abstracted_commands/statCommand';
import { createTestUser, mockClient, randomCryptoSnowflake } from './util';

describe('Datapoints', async () => {
	await mockClient();
	const userID = randomCryptoSnowflake();

	test('Data points', async () => {
		const user = await createTestUser(userID);
		const stats = await prisma.userStats.upsert({
			where: { user_id: BigInt(user.id) },
			create: { user_id: BigInt(user.id) },
			update: {}
		});
		for (const a of dataPoints) {
			try {
				await a.run(user, stats!);
			} catch (err) {
				throw new Error(`Error running ${a.name}: ${err}`);
			}
		}
	});
});
