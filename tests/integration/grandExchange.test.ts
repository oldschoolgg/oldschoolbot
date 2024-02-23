import { calcPercentOfNum, randArrItem, randInt, Time } from 'e';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { usernameCache } from '../../src/lib/constants';
import { GrandExchange } from '../../src/lib/grandExchange';
import { assert } from '../../src/lib/util';
import resolveItems from '../../src/lib/util/resolveItems';
import { geCommand } from '../../src/mahoji/commands/ge';
import { createTestUser, mockClient, TestUser } from './util';

const quantities = [-1, 0, 100_000_000_000_000_000, 1, 2, 38, 1_000_000_000_000, 500, '5*5'];
const prices = [
	-1,
	0,
	100_000_000_000_000_000,
	1,
	2,
	1_000_000_000_000,
	99,
	100,
	101,
	1005,
	4005,
	5005,
	100_000,
	'5*9999999'
];

const sampleBank = new Bank()
	.add('Coins', 1_000_000_000)
	.add('Egg', 1000)
	.add('Coal', 1000)
	.add('Trout', 1000)
	.freeze();

async function cancelAllListings(user: TestUser) {
	const results: string[] = [];
	const activeListings = await global.prisma!.gEListing.findMany({
		where: {
			user_id: user.id
		}
	});
	for (const listing of activeListings) {
		results.push(
			(await user.runCommand(geCommand, {
				cancel: {
					listing: listing.userfacing_id
				}
			})) as string
		);
	}

	return results.join('\n');
}

describe('Grand Exchange', async () => {
	const itemPool = resolveItems(['Egg', 'Trout', 'Coal']);
	GrandExchange.calculateSlotsOfUser = async () => ({ slots: 500 } as any);
	await mockClient();

	test(
		'Fuzz',
		async () => {
			assert(randInt(1, 100_000) !== randInt(1, 100_000));

			await GrandExchange.totalReset();
			await GrandExchange.init();

			const currentOwnedBank = await GrandExchange.fetchOwnedBank();
			expect(currentOwnedBank.toString()).toEqual(new Bank().toString());
			let amountOfUsers = randInt(200, 300);

			const totalExpectedBank = sampleBank.clone().multiply(amountOfUsers);
			let users: TestUser[] = [];

			for (let i = 0; i < amountOfUsers; i++) {
				const user = await createTestUser();
				await user.addItemsToBank({ items: sampleBank });
				users.push(user);
			}

			for (let i = 0; i < users.length; i++) {
				for (const item of itemPool) {
					const method = randArrItem(['buy', 'sell']);
					let quantity = randArrItem(quantities);
					let price = randArrItem(prices);
					users[i].runCommand(geCommand, {
						[method]: {
							item,
							quantity,
							price
						}
					});
				}
			}

			for (let i = 0; i < 100; i++) {
				await GrandExchange.tick();
				await Promise.all([
					GrandExchange.checkGECanFullFilAllListings(),
					GrandExchange.extensiveVerification()
				]);
			}

			const testBank = new Bank();
			const cancelPromises = [];
			for (const user of users) {
				cancelPromises.push(cancelAllListings(user));
			}

			await Promise.all(cancelPromises);
			await Promise.all(users.map(u => u.sync()));

			for (const user of users) {
				testBank.add(user.bankWithGP);
			}

			await GrandExchange.checkGECanFullFilAllListings();
			await GrandExchange.extensiveVerification();

			const data = await GrandExchange.fetchData();
			expect(data.isLocked).toEqual(false);
			expect(data.taxBank).toBeGreaterThan(0);
			expect(data.totalTax).toBeGreaterThan(0);

			const totalTaxed = await global.prisma!.gETransaction.aggregate({
				_sum: {
					total_tax_paid: true
				}
			});
			const totalTaxGP = Number(totalTaxed._sum.total_tax_paid!);
			expect(totalTaxGP).toEqual(data.taxBank);
			expect(totalTaxGP).toEqual(data.totalTax);
			expect(testBank.amount('Coins')).toBeLessThanOrEqual(totalExpectedBank.amount('Coins'));
			expect(testBank.amount('Coins') + totalTaxGP).toEqual(totalExpectedBank.amount('Coins'));
			expect(testBank.toString()).toEqual(totalExpectedBank.clone().remove('Coins', totalTaxGP).toString());

			await GrandExchange.queue.onEmpty();
			assert(GrandExchange.queue.size === 0, 'Queue should be empty');
		},
		{
			repeats: 1,
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

		const amountSold = 50;
		const priceSoldAt = 100;
		const totalGPBeforeTax = amountSold * priceSoldAt;
		const taxPerItem = calcPercentOfNum(1, priceSoldAt);
		expect(taxPerItem).toEqual(1);
		const totalTax = taxPerItem * amountSold;
		expect(taxPerItem).toEqual(1);
		const gpShouldBeReceivedAfterTax = totalGPBeforeTax - totalTax;
		expect(gpShouldBeReceivedAfterTax).toEqual(4950);

		await cancelAllListings(wes);
		await cancelAllListings(magnaboy);

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
		expect(data.taxBank).toEqual(totalTax);
		expect(data.totalTax).toEqual(totalTax);
	});
});
