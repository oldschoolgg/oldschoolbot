import { Bank } from 'oldschooljs';
import { expect, test } from 'vitest';

import { MonsterActivityTaskOptions } from '../../src/lib/types/minions';
import { killCommand } from '../../src/mahoji/commands/k';
import { createTestUser, mockClient } from './util';

test('Killing Men', async () => {
	await mockClient();
	const user = await createTestUser();
	const startingBank = new Bank().add('Shark', 1_000_000);
	await user.addItemsToBank({ items: startingBank });
	await user.max();
	await user.runCommand(killCommand, {
		name: 'general graardor'
	});

	(await user.runActivity()) as MonsterActivityTaskOptions;
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
