import { Time, calcPercentOfNum, randArrItem, randInt, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import PQueue from 'p-queue';
import { describe, expect, test } from 'vitest';

import { usernameCache } from '../../src/lib/constants';
import { GrandExchange } from '../../src/lib/grandExchange';
import { prisma } from '../../src/lib/settings/prisma';
import { assert } from '../../src/lib/util';
import resolveItems from '../../src/lib/util/resolveItems';
import { geCommand } from '../../src/mahoji/commands/ge';
import { cancelUsersListings } from '../../src/mahoji/lib/abstracted_commands/cancelGEListingCommand';
import type { TestUser } from './util';
import { createTestUser, mockClient } from './util';

const TICKS_TO_RUN = 100;
const AMOUNT_USERS = 20;

const quantities = [1, 2, 38, 500, '5*5'];
const prices = [1, 30, 33, 55];

const sampleBank = new Bank()
	.add('Coins', 1_000_000_000)
	.add('Egg', 1000)
	.add('Coal', 1000)
	.add('Trout', 1000)
	.freeze();

describe('Grand Exchange', async () => {
	const itemPool = resolveItems(['Egg', 'Trout', 'Coal']);
	GrandExchange.calculateSlotsOfUser = async () => ({ slots: 500 }) as any;
	await mockClient();

	async function waitForGEToBeEmpty() {
		await GrandExchange.queue.onEmpty();
		assert(!GrandExchange.locked, 'G.E should not be locked');
	}

	test(
		'Fuzz',
		async () => {
			// biome-ignore lint/suspicious/noSelfCompare: <explanation>
			assert(randInt(1, 100_000) !== randInt(1, 100_000));

			await GrandExchange.totalReset();
			await GrandExchange.init();

			const currentOwnedBank = await GrandExchange.fetchOwnedBank();
			expect(currentOwnedBank.toString()).toEqual(new Bank().toString());

			const totalExpectedBank = sampleBank.clone().multiply(AMOUNT_USERS);
			let users: TestUser[] = [];

			for (let i = 0; i < AMOUNT_USERS; i++) {
				users.push(
					(async () => {
						const user = await createTestUser();
						await user.addItemsToBank({ items: sampleBank });
						return user;
					})() as any
				);
			}
			users = await Promise.all(users);
			console.log(`Finished initializing ${AMOUNT_USERS} users`);

			// Run a bunch of commands to buy/sell
			const commandPromises = new PQueue({ concurrency: 20 });
			for (const user of shuffleArr(users)) {
				commandPromises.add(async () => {
					for (let i = 0; i < 5;i++) {
						const method = randArrItem(['buy', 'sell']);
					const quantity = randArrItem(quantities);
					const price = randArrItem(prices);
					for (const item of itemPool) {
						await user.runCommand(geCommand, {
							[method]: {
								item,
								quantity,
								price
							}
						});
					}
					}
				});
			}
			await commandPromises.onEmpty();
			await waitForGEToBeEmpty();
			console.log('Finished running all commands');

			// Tick the g.e to make some transactions
			for (let i = 0; i < TICKS_TO_RUN; i++) {
				await GrandExchange.tick();
				await GrandExchange.extensiveVerification();
			}
			await waitForGEToBeEmpty();
			const count = await prisma.gETransaction.count();
			console.log(`Finished ticking ${TICKS_TO_RUN} times, made ${count} transactions`);

			// Cancel all remaining listings
			const cancelPromises = [];
			for (const user of users) {
				cancelPromises.push(cancelUsersListings(user));
			}
			await Promise.all(cancelPromises);
			await waitForGEToBeEmpty();
			const { buyListings, sellListings } = await GrandExchange.fetchActiveListings();
			if (buyListings.length > 0 || sellListings.length > 0) {
				throw new Error('There should be no active listings!');
			}
			const newCurrentOwnedBank = await GrandExchange.fetchOwnedBank();
			if (newCurrentOwnedBank.length !== 0) {
				throw new Error('There should be no items in the G.E bank!');
			}
			console.log('Finished cancelling');

			await Promise.all(users.map(u => u.sync()));

			const testBank = new Bank();
			for (const user of users) {
				testBank.add(user.bankWithGP);
			}

			await GrandExchange.checkGECanFullFilAllListings();
			await GrandExchange.extensiveVerification();

			const data = await GrandExchange.fetchData();
			expect(data.isLocked).toEqual(false);

			const totalTaxed = await global.prisma!.gETransaction.aggregate({
				_sum: {
					total_tax_paid: true
				}
			});
			const totalTaxGP = Number(totalTaxed._sum.total_tax_paid!);
			const taxDebugStr = `Based on transactions, received ${totalTaxGP} tax
Based on G.E data, we should have received ${data.totalTax} tax`;
			expect(totalTaxGP, taxDebugStr).toEqual(data.taxBank);
			expect(totalTaxGP, taxDebugStr).toEqual(data.totalTax);
			expect(testBank.amount('Coins'), 'A5D').toBeLessThanOrEqual(totalExpectedBank.amount('Coins'));
			expect(testBank.amount('Coins') + totalTaxGP, 'M3S').toEqual(totalExpectedBank.amount('Coins'));
			expect(testBank.toString(), '9N3').toEqual(
				totalExpectedBank.clone().remove('Coins', totalTaxGP).toString()
			);

			await GrandExchange.queue.onEmpty();
			assert(GrandExchange.queue.size === 0, 'Queue should be empty');
		},
		{
			timeout: Time.Minute * 5
		}
	);

	test('Refund issue', async () => {
		await GrandExchange.totalReset();
		await GrandExchange.init();

		const currentOwnedBank = await GrandExchange.fetchOwnedBank();
		expect(currentOwnedBank.toString()).toEqual(new Bank().toString());

		const wes = await createTestUser();
		const magnaboy = await createTestUser();

		usernameCache.set(wes.id, 'Wes');
		usernameCache.set(magnaboy.id, 'Magnaboy');

		await magnaboy.addItemsToBank({ items: sampleBank });
		await wes.addItemsToBank({ items: sampleBank });
		assert(magnaboy.bankWithGP.equals(sampleBank), 'Test users bank should match sample bank');
		assert(wes.bankWithGP.equals(sampleBank), 'Test users bank should match sample bank');

		await magnaboy.runCommand(geCommand, {
			buy: {
				item: 'egg',
				quantity: 100,
				price: 100
			}
		});

		await wes.runCommand(geCommand, {
			sell: {
				item: 'egg',
				quantity: 50,
				price: 50
			}
		});

		await GrandExchange.tick();
		await GrandExchange.tick();

		// The user object isn't updated by the GE tick, since that uses completely separate user objects.
		await wes.sync();
		await magnaboy.sync();

		const amountSold = 50;
		const priceSoldAt = 100;
		const totalGPBeforeTax = amountSold * priceSoldAt;
		const taxPerItem = calcPercentOfNum(1, priceSoldAt);
		expect(taxPerItem).toEqual(1);
		const totalTax = taxPerItem * amountSold;
		expect(totalTax).toEqual(50);
		const gpShouldBeReceivedAfterTax = totalGPBeforeTax - totalTax;
		expect(gpShouldBeReceivedAfterTax).toEqual(4950);

		await cancelUsersListings(wes);
		await cancelUsersListings(magnaboy);

		expect(wes.bankWithGP.toString()).toEqual(
			new Bank()
				.add('Egg', 1000 - amountSold)
				.add('Coal', 1000)
				.add('Trout', 1000)
				.add('Coins', 1_000_000_000 + gpShouldBeReceivedAfterTax)
				.toString()
		);

		expect(magnaboy.bankWithGP.toString()).toEqual(
			new Bank()
				.add('Egg', 1000 + amountSold)
				.add('Coal', 1000)
				.add('Trout', 1000)
				.add('Coins', 1_000_000_000 - totalGPBeforeTax)
				.toString()
		);

		expect(magnaboy.bankWithGP.clone().add(wes.bankWithGP).toString()).toEqual(
			sampleBank.clone().multiply(2).remove('Coins', totalTax).toString()
		);

		const bank = await GrandExchange.fetchOwnedBank();
		expect(bank.length).toEqual(0);

		const data = await GrandExchange.fetchData();
		expect(data.taxBank, 'LZ9').toEqual(totalTax);
		expect(data.totalTax, 'M39').toEqual(totalTax);
	});
});
