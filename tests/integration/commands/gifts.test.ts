import { Bank } from 'oldschooljs';
import { beforeEach, describe, test } from 'vitest';

import { giftCommand } from '../../../src/mahoji/commands/gift';
import { createTestUser, mockClient } from '../util';

describe('Gift Command', async () => {
	const client = await mockClient();
	const user = await createTestUser();

	beforeEach(async () => {
		await user.reset();
		await client.reset();
	});

	test('Gift', async () => {
		await user.addItemsToBank({
			items: new Bank().add('Coal', 100).add('Egg', 100).add('Coins', 100_000)
		});

		await user.runCommand(giftCommand, { create: { items: '50 coal, 50 egg, 100k coins', name: 'Test Gift' } });
		await user.bankMatch(new Bank().add('Coal', 50).add('Egg', 50));
	});
});
