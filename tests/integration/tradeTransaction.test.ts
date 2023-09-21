import { randomSnowflake } from '@oldschoolgg/toolkit';
import { Prisma } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { prisma } from '../../src/lib/settings/prisma';

describe('Transactionalized Trade Test', async () => {
	async function createUserWithBank(bank: Bank, userData: Partial<Prisma.UserCreateInput> = {}) {
		const userId = randomSnowflake();
		const GP = bank.amount('Coins');
		delete bank.bank[995];

		await prisma.user.create({
			data: { id: userId, GP, bank: bank.bank, ...userData }
		});

		return userId;
	}

	const cyr = await createUserWithBank(
		new Bank().add('Coins', 10_000_000).add('Twisted bow', 2).add('Dragon arrow', 1000)
	);
	const magna = await createUserWithBank(
		new Bank().add('Coins', 20_000_000).add('Cannonball', 10_000).add('Feather', 500)
	);
});
