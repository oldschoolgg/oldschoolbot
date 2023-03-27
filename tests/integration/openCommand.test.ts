import { randomSnowflake } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { beforeEach, describe, expect, test } from 'vitest';

import { openCommand } from '../../src/mahoji/commands/open';
import { randomMock } from './setup';
import { createTestUser, mockClient } from './util';

describe('Open Command', async () => {
	await mockClient();
	const userID = randomSnowflake();
	const sampleOpenablesBank = new Bank().add('Reward casket (beginner)', 100).freeze();

	const user = await createTestUser(userID);

	beforeEach(async () => {
		randomMock();
		await user.reset();
		await user.addItemsToBank({ items: sampleOpenablesBank });
	});

	test('Open with no quantity', async () => {
		const result = await user.runCommand(openCommand, { name: 'reward casket (beginner)' });
		expect(result).toMatchObject({
			content: `You have now opened a total of 1x Reward casket (beginner)
1x Beginner Clue Casket `
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
		await user.runCommand(openCommand, { name: 'reward casket (beginner)', quantity: 10 });
		await user.bankAmountMatch('Reward casket (beginner)', 90);
		await user.openedBankMatch(new Bank().add('Reward casket (beginner)', 10));
	});
});
