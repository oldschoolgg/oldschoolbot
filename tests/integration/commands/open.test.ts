import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { BitField } from '../../../src/lib/constants.js';
import { openCommand } from '../../../src/mahoji/commands/open.js';
import { createTestUser, mockClient, mockMathRandom } from '../util.js';

describe('Open Command', async () => {
	await mockClient();
	test('Open with no quantity', async () => {
		mockMathRandom(0.1);
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Reward casket (beginner)', 100) });
		const result = await user.runCommand(openCommand, { name: 'reward casket (beginner)' });
		expect(result).toMatchObject({
			content: `You have now opened a total of 1x Reward casket (beginner)
1x Beginner Clue Casket`
		});
		await user.bankAmountMatch('Reward casket (beginner)', 99);
		await user.openedBankMatch(new Bank().add('Reward casket (beginner)', 1));
		await user.bankMatch(new Bank().add('Reward casket (beginner)', 99).add('Fire rune', 17));
		await user.runCommand(openCommand, { name: 'reward casket (beginner)' });
		await user.bankAmountMatch('Reward casket (beginner)', 98);
		await user.openedBankMatch(new Bank().add('Reward casket (beginner)', 2));
		await user.bankMatch(new Bank().add('Reward casket (beginner)', 98).add('Fire rune', 34));
		await user.clMatch(new Bank().add('Fire rune', 34));
	});

	test('Open with quantity', async () => {
		mockMathRandom(0.1);
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Reward casket (beginner)', 100) });
		await user.runCommand(openCommand, { name: 'reward casket (beginner)', quantity: 10 });
		await user.bankAmountMatch('Reward casket (beginner)', 90);
		await user.openedBankMatch(new Bank().add('Reward casket (beginner)', 10));
	});

	test('Open until respects quantity cap', async () => {
		mockMathRandom(0.1);
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Reward casket (beginner)', 10) });
		await user.runCommand(openCommand, {
			name: 'reward casket (beginner)',
			quantity: 2,
			open_until: 'Fire rune',
			result_quantity: 100
		});
		await user.bankAmountMatch('Reward casket (beginner)', 8);
		await user.openedBankMatch(new Bank().add('Reward casket (beginner)', 2));
	});

	test('Open until rejects invalid item', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Reward casket (beginner)', 10) });
		const res = await user.runCommand(openCommand, {
			name: 'reward casket (beginner)',
			quantity: 2,
			open_until: 'Twisted bow',
			result_quantity: 100
		});
		expect(res).toEqual("Reward casket (beginner) doesn't drop Twisted bow.");
		const res2 = await user.runCommand(openCommand, {
			name: 'reward casket (beginner)',
			quantity: 2,
			open_until: 'Twisted bowffdsafsdfasdf',
			result_quantity: 100
		});
		expect(res2).toContain("That's not a valid item to open until");
	});

	test('Open until allows Gold key crimson -> Clue scroll (elite)', async () => {
		mockMathRandom(0.1);
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Gold key crimson', 10) });
		const res = await user.runCommand(openCommand, {
			name: 'gold key crimson',
			quantity: 2,
			open_until: 'Clue scroll (elite)',
			result_quantity: 25
		});
		expect(res).not.toEqual("Gold key crimson doesn't drop Clue scroll (elite).");
		await user.bankAmountMatch('Gold key crimson', 8);
		await user.openedBankMatch(new Bank().add('Gold key crimson', 2));
	});

	test('Rejects invalid result_quantity', async () => {
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Reward casket (beginner)', 10) });
		for (const num of ['not a number', -1, 0]) {
			const res = await user.runCommand(openCommand, {
				name: 'reward casket (beginner)',
				open_until: 'Fire rune',
				result_quantity: num
			});
			expect(res).toEqual(`The result quantity must be a positive integer.`);
		}
	});

	test('Rejects invalid maxOpenQuantity', async () => {
		const user = await createTestUser();
		await user.givePatronTier(2);
		await user.addItemsToBank({ items: new Bank().add('Reward casket (beginner)', 10) });
		for (const num of ['not a number', -1]) {
			const res = await user.runCommand(openCommand, {
				name: 'reward casket (beginner)',
				open_until: 'Fire rune',
				quantity: num
			});
			expect(res).toEqual(`The quantity must be a positive integer.`);
		}
	});

	test('Rejects trying to open all with no openables', async () => {
		const user = await createTestUser();
		const res = await user.runCommand(openCommand, {
			name: 'all'
		});
		expect(res).toEqual('You have no openable items.');
	});

	test('Auto sell/drop details from opened loot only show with detailed info enabled', async () => {
		const hiddenUser = await createTestUser();
		await hiddenUser.givePatronTier(3);
		await hiddenUser.addItemsToBank({ items: new Bank().add('Amylase pack') });
		await hiddenUser.update({
			auto_drop_bank: new Bank().add('Amylase crystal').toJSON()
		});

		const hiddenResult = await hiddenUser.runCommand(openCommand, { name: 'amylase pack' });
		expect(hiddenResult).toMatchObject({
			content: expect.not.stringContaining('automatically dropped')
		});
		await hiddenUser.bankMatch(new Bank());
		expect(hiddenUser.consumeAutoSellDropMessages()).toHaveLength(0);

		const detailedUser = await createTestUser();
		await detailedUser.givePatronTier(3);
		await detailedUser.addItemsToBank({ items: new Bank().add('Amylase pack') });
		await detailedUser.update({
			auto_drop_bank: new Bank().add('Amylase crystal').toJSON(),
			bitfield: {
				push: BitField.ShowDetailedInfo
			}
		});

		const detailedResult = await detailedUser.runCommand(openCommand, { name: 'amylase pack' });
		expect(detailedResult).toMatchObject({
			content: expect.stringContaining('You received 100x Amylase crystal. It was automatically dropped.')
		});
		await detailedUser.bankMatch(new Bank());
		expect(detailedUser.consumeAutoSellDropMessages()).toHaveLength(0);
	});
});
