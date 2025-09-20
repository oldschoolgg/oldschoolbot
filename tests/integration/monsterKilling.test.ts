import { Bank } from 'oldschooljs';
import { expect, test } from 'vitest';

import { minionKCommand } from '../../src/mahoji/commands/k.js';
import { createTestUser, mockClient } from './util.js';

test('Killing Men', async () => {
	await mockClient();
	const user = await createTestUser();
	const startingBank = new Bank().add('Shark', 1_000_000);
	await user.addItemsToBank({ items: startingBank });
	await user.max();
	await user.runCommand(minionKCommand, {
		name: 'general graardor'
	});

	await user.runActivity();
	await user.sync();

	expect(user.bank.amount('Shark')).toBeLessThan(1_000_000);

	expect(
		await global.prisma!.xPGain.count({
			where: {
				user_id: BigInt(user.id)
			}
		})
	).toBeGreaterThan(0);
});
