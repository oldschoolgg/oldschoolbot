import { Bank, EQuest } from 'oldschooljs';
import { expect, test } from 'vitest';

import { minionKCommand } from '../../src/mahoji/commands/k';
import { mockClient, mockUser } from './util';

test('Killing Bandos', async () => {
	await mockClient();
	const user = await mockUser({ finished_quest_ids: [EQuest.TROLL_STRONGHOLD] });
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
