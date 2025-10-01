import { randArrItem, randInt, roll } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { payCommand } from '../../src/mahoji/commands/pay.js';
import type { TestUser } from './util.js';
import { createTestUser, mockClient, mockUserOption } from './util.js';

describe('Payment conflicts', async () => {
	const payerCount = 20;
	const iterations = 20;
	const addChance = 3;

	const bigBank = new Bank().add('Cannonball', 4).add('Bones', 10_000);

	test(
		'GE Simulation (Payee)',
		{
			timeout: Time.Minute * 2,
		},
		async () => {
			await mockClient();

			// Payee is currently the primary target of the test.
			const userPayee = await createTestUser(new Bank(bigBank), { GP: 1_000_000_000 });

			const payeeTarget = await globalClient.users.fetch(userPayee.id);

			const startingBallCount = userPayee.bank.amount('Cannonball');

			const payers: TestUser[] = [];
			for (let i = 0; i < payerCount; i++) {
				payers.push(await createTestUser(new Bank(), { GP: 1_000_000_000 }));
			}

			const promisePay = async () => {
				const payer = randArrItem(payers);
				const amount = randInt(100_000, 1_000_000);
				await payer.runCommand(payCommand, {
					user: mockUserOption(payeeTarget.id),
					amount: amount.toString()
				});
			};

			const promiseAdd = async () => {
				await userPayee.addItemsToBank({ items: new Bank().add('Cannonball', 100) });
			};

			const promises: Promise<void>[] = [];
			let newBalls = 0;
			for (let j = 0; j < iterations; j++) {
				if (roll(addChance)) {
					newBalls += 100;
					promises.push(promiseAdd());
				} else {
					promises.push(promisePay());
				}
			}

			await Promise.all(promises);

			let totalGp = 0;
			await userPayee.sync();
			await Promise.all(payers.map(u => u.sync()));
			totalGp += userPayee.GP;
			for (const payer of payers) totalGp += payer.GP;

			expect(totalGp).toEqual(1_000_000_000 * (payerCount + 1));
			expect(userPayee.bank.amount('Cannonball') - startingBallCount).toEqual(newBalls);
		}
	);

	test('GE Simulation (Payer)', async () => {
		await mockClient();
		// May as well test for the Payer also, even though so far we're solid here.
		const userPayer = await createTestUser(new Bank(bigBank), { GP: 1_000_000_000 });

		const startingBallCount = userPayer.bank.amount('Cannonball');

		const payees: TestUser[] = [];
		for (let i = 0; i < payerCount; i++) {
			payees.push(await createTestUser(new Bank(), { GP: 1_000_000_000 }));
		}

		const promisePay = async () => {
			const payee = randArrItem(payees);
			const payeeTarget = await globalClient.users.fetch(payee.id);
			return new Promise<void>(async resolve => {
				const amount = randInt(100_000, 1_000_000);
				await userPayer.runCommand(payCommand, {
					user: mockUserOption(payeeTarget.id),
					amount: amount.toString()
				});
				resolve();
			});
		};

		const promiseAdd = async () => {
			return new Promise<void>(async resolve => {
				await userPayer.addItemsToBank({ items: new Bank().add('Cannonball', 100) });
				resolve();
			});
		};

		const promises: Promise<void>[] = [];
		let newBalls = 0;
		for (let j = 0; j < iterations; j++) {
			if (roll(addChance)) {
				newBalls += 100;
				promises.push(promiseAdd());
			} else {
				promises.push(promisePay());
			}
		}

		await Promise.all(promises);

		let totalGp = 0;
		await userPayer.sync();
		await Promise.all(payees.map(u => u.sync()));
		totalGp += userPayer.GP;
		for (const payee of payees) totalGp += payee.GP;

		expect(totalGp).toEqual(1_000_000_000 * (payerCount + 1));
		expect(userPayer.bank.amount('Cannonball') - startingBallCount).toEqual(newBalls);
	});
});
