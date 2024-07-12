import { Time, randArrItem, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { payCommand } from '../../src/mahoji/commands/pay';
import type { TestUser } from './util';
import { createTestUser, mockClient } from './util';

describe('Payment conflicts', async () => {
	const payerCount = 20;
	const iterations = 20;
	const addChance = 3;
	const repeats = 1;

	const bigBank = new Bank().add('Cannonball', 4).add('Bones', 10_000);

	test(
		'GE Simulation (Payee)',
		async () => {
			await mockClient();

			// Payee is currently the primary target of the test.
			const userPayee = await createTestUser(new Bank(bigBank), { GP: 1_000_000_000 });

			const payeeTarget = await globalClient.fetchUser(userPayee.id);

			const startingBallCount = userPayee.bank.amount('Cannonball');

			const payers: TestUser[] = [];
			for (let i = 0; i < payerCount; i++) {
				payers.push(await createTestUser(new Bank(), { GP: 1_000_000_000 }));
			}

			const promisePay = async () => {
				const payer = randArrItem(payers);
				return new Promise<void>(async resolve => {
					const amount = randInt(100_000, 1_000_000);
					await payer.runCommand(payCommand, { user: { user: payeeTarget }, amount: amount.toString() });
					resolve();
				});
			};
			const promiseAdd = async () => {
				return new Promise<void>(async resolve => {
					await userPayee.addItemsToBank({ items: new Bank().add('Cannonball', 100) });
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
			await userPayee.sync();
			await Promise.all(payers.map(u => u.sync()));
			totalGp += userPayee.GP;
			for (const payer of payers) totalGp += payer.GP;

			expect(totalGp).toEqual(1_000_000_000 * (payerCount + 1));
			expect(userPayee.bank.amount('Cannonball') - startingBallCount).toEqual(newBalls);
		},
		{
			timeout: Time.Minute * 5,
			repeats
		}
	);

	test(
		'GE Simulation (Payer)',
		async () => {
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
				const payeeTarget = await globalClient.fetchUser(payee.id);
				return new Promise<void>(async resolve => {
					const amount = randInt(100_000, 1_000_000);
					await userPayer.runCommand(payCommand, { user: { user: payeeTarget }, amount: amount.toString() });
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
		},
		{
			timeout: Time.Minute * 5,
			repeats
		}
	);
});
