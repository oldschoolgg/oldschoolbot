import type { Prisma } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { tradePlayerItems } from '../../src/lib/util/tradePlayerItems';
import { mockedId } from './util';

describe('Transactionalized Trade Test', async () => {
	async function createUserWithBank(bank: Bank, userData: Partial<Prisma.UserCreateInput> = {}) {
		const userId = mockedId();
		const GP = bank.amount('Coins');
		bank.bank[995] = undefined;

		await global.prisma!.user.create({
			data: { id: userId, GP, bank: bank.bank, ...userData }
		});

		return userId;
	}

	test('Test valid trade between Cyr and Magna...', async () => {
		const startingBankCyr = new Bank().add('Coins', 10_000_000).add('Twisted bow', 2).add('Dragon arrow', 1000);
		const cyr = await createUserWithBank(startingBankCyr);
		const startingBankMagna = new Bank().add('Coins', 20_000_000).add('Cannonball', 10_000).add('Feather', 500);
		const magna = await createUserWithBank(startingBankMagna);

		const uCyr = await mUserFetch(cyr);
		const uMagna = await mUserFetch(magna);

		const tradeFromCyr = new Bank().add('Coins', 1_000_000).add('Twisted bow', 1);
		const tradeFromMagna = new Bank().add('Coins', 2_000_000).add('Feather', 500).add('Cannonball', 2000);

		const result = await tradePlayerItems(uCyr, uMagna, tradeFromCyr, tradeFromMagna);

		expect(result.message).toBe(null);
		expect(result.success).toBe(true);

		const cyrExpectsBank = new Bank()
			.add('Coins', 11_000_000)
			.add('Twisted bow', 1)
			.add('Dragon arrow', 1000)
			.add('Cannonball', 2000)
			.add('Feather', 500);
		const magnaExpectsBank = new Bank().add('Coins', 19_000_000).add('Twisted bow', 1).add('Cannonball', 8000);

		expect(uCyr.bankWithGP.equals(cyrExpectsBank)).toBe(true);
		expect(uMagna.bankWithGP.equals(magnaExpectsBank)).toBe(true);
	});

	test('One sided trade...', async () => {
		const startingBankCyr = new Bank().add('Coins', 10_000_000).add('Twisted bow', 2).add('Dragon arrow', 1000);
		const cyr = await createUserWithBank(startingBankCyr);
		const startingBankMagna = new Bank().add('Coins', 20_000_000).add('Cannonball', 10_000).add('Feather', 500);
		const magna = await createUserWithBank(startingBankMagna);

		const uCyr = await mUserFetch(cyr);
		const uMagna = await mUserFetch(magna);

		const tradeFromCyr = new Bank();
		const tradeFromMagna = new Bank().add('Coins', 1_000_000).add('Feather', 500).add('Cannonball', 2000);

		const result = await tradePlayerItems(uCyr, uMagna, tradeFromCyr, tradeFromMagna);

		expect(result.message).toBe(null);
		expect(result.success).toBe(true);

		const cyrExpectsBank = new Bank()
			.add('Coins', 11_000_000)
			.add('Twisted bow', 2)
			.add('Dragon arrow', 1000)
			.add('Cannonball', 2000)
			.add('Feather', 500);
		const magnaExpectsBank = new Bank().add('Coins', 19_000_000).add('Cannonball', 8000);

		expect(uCyr.bankWithGP.equals(cyrExpectsBank)).toBe(true);
		expect(uMagna.bankWithGP.equals(magnaExpectsBank)).toBe(true);
	});

	test('Other sided trade. no GP...', async () => {
		const startingBankCyr = new Bank().add('Coins', 10_000_000).add('Twisted bow', 2).add('Dragon arrow', 1000);
		const cyr = await createUserWithBank(startingBankCyr);
		const startingBankMagna = new Bank().add('Coins', 20_000_000).add('Cannonball', 10_000).add('Feather', 500);
		const magna = await createUserWithBank(startingBankMagna);

		const uCyr = await mUserFetch(cyr);
		const uMagna = await mUserFetch(magna);

		const tradeFromCyr = new Bank().add('Twisted bow', 2);
		const tradeFromMagna = new Bank();

		const result = await tradePlayerItems(uCyr, uMagna, tradeFromCyr, tradeFromMagna);

		expect(result.message).toBe(null);
		expect(result.success).toBe(true);

		const cyrExpectsBank = new Bank().add('Coins', 10_000_000).add('Dragon arrow', 1000);
		const magnaExpectsBank = new Bank()
			.add('Coins', 20_000_000)
			.add('Cannonball', 10_000)
			.add('Feather', 500)
			.add('Twisted bow', 2);

		expect(uCyr.bankWithGP.equals(cyrExpectsBank)).toBe(true);
		expect(uMagna.bankWithGP.equals(magnaExpectsBank)).toBe(true);
	});

	test('Test not enough GP trade...', async () => {
		const cyrStartingBank = new Bank().add('Coins', 1_000_000).add('Twisted bow', 2).add('Dragon arrow', 1000);
		const cyr = await createUserWithBank(cyrStartingBank);

		const magnaStartingBank = new Bank().add('Coins', 20_000_000).add('Cannonball', 10_000).add('Feather', 500);
		const magna = await createUserWithBank(magnaStartingBank);

		const uCyr = await mUserFetch(cyr);
		const uMagna = await mUserFetch(magna);

		const tradeFromCyr = new Bank().add('Coins', 2_000_000).add('Twisted bow', 1);
		const tradeFromMagna = new Bank().add('Coins', 2_000_000).add('Feather', 500).add('Cannonball', 2000);

		const result = await tradePlayerItems(uCyr, uMagna, tradeFromCyr, tradeFromMagna);

		const expectedResult = { success: false, message: `<@${cyr}> doesn't own all items.` };

		expect(result).toMatchObject(expectedResult);
		expect(uCyr.bank.equals(cyrStartingBank)).toBe(true);
		expect(uMagna.bank.equals(magnaStartingBank)).toBe(true);
	});

	test('Test not enough items trade...', async () => {
		const cyrStartingBank = new Bank().add('Coins', 1_000_000).add('Twisted bow', 2).add('Dragon arrow', 1000);
		const cyr = await createUserWithBank(cyrStartingBank);

		const magnaStartingBank = new Bank().add('Coins', 20_000_000).add('Cannonball', 10_000).add('Feather', 500);
		const magna = await createUserWithBank(magnaStartingBank);

		const uCyr = await mUserFetch(cyr);
		const uMagna = await mUserFetch(magna);

		const tradeFromCyr = new Bank().add('Coins', 1_000_000).add('Twisted bow', 1);
		const tradeFromMagna = new Bank().add('Coins', 2_000_000).add('Feather', 5000).add('Cannonball', 2000);

		const result = await tradePlayerItems(uCyr, uMagna, tradeFromCyr, tradeFromMagna);

		const expectedResult = { success: false, message: `<@${magna}> doesn't own all items.` };

		expect(result).toMatchObject(expectedResult);
		expect(uCyr.bank.equals(cyrStartingBank)).toBe(true);
		expect(uMagna.bank.equals(magnaStartingBank)).toBe(true);
	});
});
