import { Emoji } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { sacrificeCommand } from '../../../src/mahoji/commands/sacrifice.js';
import { createTestUser, mockClient } from '../util.js';

describe('Sacrifice Command', async () => {
	await mockClient();

	test('No options provided', async () => {
		const user = await createTestUser();

		await user.addItemsToBank({ items: new Bank().add('Trout').add('Coal', 10) });
		await user.runCommand(sacrificeCommand, { items: '1 trout, 10 coal' });
		const result = await user.runCommand(sacrificeCommand, {});
		expect(result).toEqual(
			`${Emoji.Incinerator} **Your Sacrifice Stats** ${Emoji.Incinerator}\n\n**Current Minion Icon:** ${Emoji.Minion}\n**Sacrificed Value:** 1,590 GP\n**Unique Items Sacrificed:** 2 items`
		);
	});

	test('No items provided', async () => {
		const user = await createTestUser();
		const result = await user.runCommand(sacrificeCommand, { items: 'aaaa' });
		expect(result).toEqual('No items were provided.\nYour current sacrificed value is: 0 (0)');
	});

	test('Successful', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Trout').add('Coal', 10) });
		const result = await user.runCommand(sacrificeCommand, { items: '1 trout, 10 coal' });
		await user.sync();
		expect(result).toEqual(
			'You sacrificed 10x Coal, 1x Trout, with a value of 1,590gp (1.6k). Your total amount sacrificed is now: 1,590. '
		);
		const stats = await user.fetchStats();
		expect(user.bank.toString()).toBe(new Bank().toString());
		expect(new Bank(stats.sacrificed_bank as ItemBank).toString()).toEqual(
			new Bank().add('Coal', 10).add('Trout', 1).toString()
		);
		expect(user.user.sacrificedValue).toEqual(BigInt(1590));
		const clientSettings = await ClientSettings.fetch({ economyStats_sacrificedBank: true });
		expect(
			new Bank(clientSettings.economyStats_sacrificedBank as ItemBank).equals(
				new Bank().add('Coal', 20).add('Trout', 2)
			)
		).toEqual(true);
		await user.addItemsToBank({ items: new Bank().add('Trout').add('Cake') });
		const res = await user.runCommand(sacrificeCommand, { items: '1 trout, 1 cake' });
		expect(res).toEqual(
			'You sacrificed 1x Cake, 1x Trout, with a value of 257gp (257). Your total amount sacrificed is now: 1,847. '
		);
		await user.sync();
		expect(user.bank.toString()).toBe(new Bank().toString());

		const stats2 = await user.fetchStats();
		expect(new Bank(stats2.sacrificed_bank as ItemBank).toString()).toEqual('1x Cake, 10x Coal, 2x Trout');
		expect(user.user.sacrificedValue).toEqual(BigInt(1847));

		const clientSettings2 = await ClientSettings.fetch({ economyStats_sacrificedBank: true });
		expect(
			new Bank(clientSettings2.economyStats_sacrificedBank as ItemBank).equals(
				new Bank().add('Coal', 20).add('Trout', 3).add('Cake')
			)
		).toEqual(true);
	});

	test('Cant be sac', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('BSO dragon trophy') });
		const result = await user.runCommand(sacrificeCommand, { items: 'BSO dragon trophy' });
		expect(result).toEqual("BSO dragon trophy can't be sacrificed!");
	});
});
