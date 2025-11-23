import { BSOItem } from '@/lib/bso/BSOItem.js';

import { Bank, type ItemBank, toKMB } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { sacrificeCommand } from '../../../src/mahoji/commands/sacrifice.js';
import { createTestUser, mockClient } from '../util.js';

describe('Sacrifice Command', async () => {
	await mockClient();

	test('Skipper', async () => {
		const user = await createTestUser();
		await user.update({ minion_equippedPet: BSOItem.SKIPPER });
		await user.addItemsToBank({ items: new Bank().add('Trout').add('Coal', 10) });
		const result = await user.runCommand(sacrificeCommand, { items: '1 trout, 10 coal' });
		const expectedValue = Math.floor(1590 * 1.3);
		await user.sync();
		expect(result).toContain(
			`You sacrificed 10x Coal, 1x Trout, with a value of ${expectedValue.toLocaleString()}gp (${toKMB(expectedValue)}). Your total amount sacrificed is now: ${expectedValue.toLocaleString()}.`
		);
		expect(result).toContain('Skipper has negotiated');
		const stats = await user.fetchStats();
		expect(user.bank.toString()).toBe(new Bank().toString());
		expect(new Bank(stats.sacrificed_bank as ItemBank).toString()).toEqual(
			new Bank().add('Coal', 10).add('Trout', 1).toString()
		);
		expect(user.user.sacrificedValue).toEqual(BigInt(expectedValue));
	});
});
