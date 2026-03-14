import { Bank, Monsters } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { BitField } from '@/lib/constants.js';
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

	test('Dossier guarantees rite on first open after 100 Yama KC', async () => {
		mockMathRandom(0);
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Dossier', 1) });
		await user.incrementKC(Monsters.Yama.id, 100);

		await user.runCommand(openCommand, { name: 'dossier' });
		await user.bankAmountMatch('Rite of vile transference', 1);
	});

	test('Dossier guarantees rite after 100 Yama KC even with prior dossier opens', async () => {
		mockMathRandom(0);
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Dossier', 2) });
		await user.runCommand(openCommand, { name: 'dossier' });
		await user.incrementKC(Monsters.Yama.id, 100);

		await user.runCommand(openCommand, { name: 'dossier' });
		await user.bankAmountMatch('Rite of vile transference', 1);
	});

	test('Dossier converts rite rolls to scrolls if rite is already owned/used', async () => {
		mockMathRandom(0.82);
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Rite of vile transference', 1), collectionLog: true });
		await user.removeItemsFromBank(new Bank().add('Rite of vile transference', 1));
		await user.addItemsToBank({ items: new Bank().add('Dossier', 1) });
		await user.incrementKC(Monsters.Yama.id, 100);

		await user.runCommand(openCommand, { name: 'dossier' });
		await user.bankAmountMatch('Rite of vile transference', 0);
		await user.sync();
		const scrolls = user.bank.amount('Chasm teleport scroll');
		expect(scrolls).toBeGreaterThanOrEqual(15);
		expect(scrolls).toBeLessThanOrEqual(18);
	});

	test('Dossier converts rite rolls to scrolls if rite was already used via bitfield', async () => {
		mockMathRandom(0.82);
		const user = await createTestUser();
		await user.update({
			bitfield: {
				push: BitField.HasRiteOfVileTransference
			}
		});
		await user.addItemsToBank({ items: new Bank().add('Dossier', 1) });
		await user.incrementKC(Monsters.Yama.id, 100);

		await user.runCommand(openCommand, { name: 'dossier' });
		await user.bankAmountMatch('Rite of vile transference', 0);
		await user.sync();
		const scrolls = user.bank.amount('Chasm teleport scroll');
		expect(scrolls).toBeGreaterThanOrEqual(15);
		expect(scrolls).toBeLessThanOrEqual(18);
	});

	test('Dossier converts extra rite rolls in the same opening batch to scrolls', async () => {
		mockMathRandom(0.82);
		const user = await createTestUser();
		await user.addItemsToBank({ items: new Bank().add('Dossier', 2) });
		await user.incrementKC(Monsters.Yama.id, 100);

		await user.runCommand(openCommand, { name: 'dossier', quantity: 2 });
		await user.bankAmountMatch('Rite of vile transference', 1);
		await user.sync();
		const scrolls = user.bank.amount('Chasm teleport scroll');
		expect(scrolls).toBeGreaterThanOrEqual(15);
		expect(scrolls).toBeLessThanOrEqual(18);
	});
});
