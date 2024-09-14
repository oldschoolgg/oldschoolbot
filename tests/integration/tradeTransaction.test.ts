import type { Prisma } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { tradePlayerItems } from '../../src/lib/util/tradePlayerItems';
import { mockedId } from './util';

describe('Transactionalized Trade Test', async () => {
	async function createUserWithBank(_bank: Bank, userData: Partial<Prisma.UserCreateInput> = {}) {
		const userId = mockedId();
		const bank = _bank.clone();
		const GP = bank.amount('Coins');
		bank.remove('Coins', GP);

		await global.prisma!.user.create({
			data: { id: userId, GP, bank: bank.toJSON(), ...userData }
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
		const cyrStartingBank = new Bank()
			.add('Coins', 1_000_000)
			.add('Twisted bow', 2)
			.add('Dragon arrow', 1000)
			.freeze();
		const cyr = await createUserWithBank(cyrStartingBank);

		const magnaStartingBank = new Bank()
			.add('Coins', 20_000_000)
			.add('Cannonball', 10_000)
			.add('Feather', 500)
			.freeze();
		const magna = await createUserWithBank(magnaStartingBank);

		const uCyr = await mUserFetch(cyr, { username: 'Cyr' });
		const uMagna = await mUserFetch(magna);

		expect(uCyr.GP).toBe(1_000_000);
		expect(uMagna.GP).toBe(20_000_000);

		const tradeFromCyr = new Bank().add('Coins', 2_000_000).add('Twisted bow', 1).freeze();
		const tradeFromMagna = new Bank().add('Coins', 2_000_000).add('Feather', 500).add('Cannonball', 2000).freeze();

		const result = await tradePlayerItems(uCyr, uMagna, tradeFromCyr, tradeFromMagna);

		const expectedResult = { success: false, message: `Cyr doesn't own all items.` };

		expect(result).toMatchObject(expectedResult);
		expect(uCyr.bankWithGP.toString()).toEqual(cyrStartingBank.toString());
		expect(uCyr.bankWithGP.equals(cyrStartingBank)).toBe(true);
		expect(uMagna.bankWithGP.equals(magnaStartingBank)).toBe(true);
	});

	test('Test not enough items trade...', async () => {
		const cyrStartingBank = new Bank()
			.add('Coins', 1_000_000)
			.add('Twisted bow', 2)
			.add('Dragon arrow', 1000)
			.freeze();
		const cyr = await createUserWithBank(cyrStartingBank);

		const magnaStartingBank = new Bank()
			.add('Coins', 20_000_000)
			.add('Cannonball', 10_000)
			.add('Feather', 500)
			.freeze();
		const magna = await createUserWithBank(magnaStartingBank);

		const uCyr = await mUserFetch(cyr);
		const uMagna = await mUserFetch(magna, { username: 'magna' });

		const tradeFromCyr = new Bank().add('Coins', 1_000_000).add('Twisted bow', 1).freeze();
		const tradeFromMagna = new Bank().add('Coins', 2_000_000).add('Feather', 5000).add('Cannonball', 2000).freeze();

		const result = await tradePlayerItems(uCyr, uMagna, tradeFromCyr, tradeFromMagna);

		const expectedResult = { success: false, message: `magna doesn't own all items.` };

		expect(result).toMatchObject(expectedResult);
		expect(uCyr.bankWithGP.equals(cyrStartingBank)).toBe(true);
		expect(uMagna.bankWithGP.equals(magnaStartingBank)).toBe(true);
	});
});
