import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { miscellaniaDepositCommand } from '../../../src/mahoji/lib/abstracted_commands/miscellaniaCommand';
import { createTestUser, mockClient } from '../util';

describe('Miscellania Deposit', async () => {
	await mockClient();

	test('deposit gp', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Coins', 10_000) });
		const result = await miscellaniaDepositCommand(user, 5000);
		expect(result).toBe('Deposited 5,000 GP into your coffer. New balance: 5,000 GP.');
		await user.gpMatch(5000);
		await user.sync();
		const data: any = user.user.minion_miscellania;
		expect(data.coffer).toBe(5000);
	});
});
