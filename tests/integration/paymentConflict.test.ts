import { cryptoRng } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { userQueues } from '@/lib/cache.js';
import { payCommand } from '../../src/mahoji/commands/pay.js';
import type { TestUser } from './util.js';
import { createTestUser, mockClient, mockUserOption } from './util.js';

describe('Payment conflicts', async () => {
	const payerCount = 20;
	const iterations = 10;
	const addChance = 3;

	const bigBank = new Bank().add('Cannonball', 4).add('Bones', 10_000);

	async function setupUsers() {
		const payees: TestUser[] = [];
		for (let i = 0; i < payerCount; i++) {
			payees.push(await createTestUser(new Bank(), { GP: 1_000_000_000 }));
		}
		return payees;
	}

	test(
		'GE Simulation (Payee)',
		{
			timeout: Time.Minute * 2
		},
		async () => {
			await mockClient();

			// Payee is currently the primary target of the test.
			const userPayee = await createTestUser(new Bank(bigBank), { GP: 1_000_000_000 });

			const startingBallCount = userPayee.bank.amount('Cannonball');

			const payers: TestUser[] = await setupUsers();
			const recipients: TestUser[] = await setupUsers();
			const allUsers = [userPayee, ...payers, ...recipients];

			const promisePay = async () => {
				const payer = cryptoRng.pick(payers);
				const recipient = cryptoRng.pick(recipients);
				const amount = cryptoRng.randInt(100_000, 1_000_000);
				const res = await payer.runCommand(
					payCommand,
					{
						user: mockUserOption(recipient.id),
						amount: amount.toString()
					},
					{
						bypassBusy: true
					}
				);
				if (!(res as string).startsWith('You sent')) {
					throw new Error(`Payment failed: ${res}`);
				}
			};

			const promiseAdd = async () => {
				await userPayee.addItemsToBank({ items: new Bank().add('Cannonball', 100) });
			};

			const promises: Promise<void>[] = [];
			let newBalls = 0;
			for (let j = 0; j < iterations; j++) {
				if (cryptoRng.roll(addChance)) {
					newBalls += 100;
					promises.push(promiseAdd());
				} else {
					promises.push(promisePay());
				}
			}

			await Promise.all(promises);
			let totalGP = 0;
			for (const user of allUsers) {
				await userQueues.get(user.id)?.onEmpty();
				await user.sync();
				totalGP += user.GP;
			}

			expect(totalGP).toEqual(1_000_000_000 * allUsers.length);
			expect(userPayee.bank.amount('Cannonball') - startingBallCount).toEqual(newBalls);
		}
	);

	test('GE Simulation (Payer)', async () => {
		await mockClient();
		// May as well test for the Payer also, even though so far we're solid here.
		const userPayer = await createTestUser(new Bank(bigBank), { GP: 1_000_000_000 });

		const startingBallCount = userPayer.bank.amount('Cannonball');
		const payers = await setupUsers();
		const recipients = await setupUsers();
		const allUsers = [userPayer, ...payers, ...recipients];

		const promisePay = async () => {
			const payer = cryptoRng.pick(payers);
			const recipient = cryptoRng.pick(recipients);
			const amount = 333;
			const res = await payer.runCommand(
				payCommand,
				{
					user: mockUserOption(recipient.id),
					amount: amount.toString()
				},
				{
					bypassBusy: true
				}
			);
			if (!(res as string).startsWith('You sent')) {
				throw new Error(`Payment failed: ${res}`);
			}
		};

		const promiseAdd = () => userPayer.addItemsToBank({ items: new Bank().add('Cannonball', 100) });

		const promises: Promise<unknown>[] = [];
		let newBalls = 0;
		for (let j = 0; j < iterations; j++) {
			if (cryptoRng.roll(addChance)) {
				newBalls += 100;
				promises.push(promiseAdd());
			} else {
				promises.push(promisePay());
			}
		}

		await Promise.all(promises);

		let totalGP = 0;
		for (const user of allUsers) {
			await userQueues.get(user.id)?.onEmpty();
			await user.sync();
			totalGP += user.GP;
		}

		expect(totalGP).toEqual(1_000_000_000 * allUsers.length);
		expect(userPayer.bank.amount('Cannonball') - startingBallCount).toEqual(newBalls);
	});
});
