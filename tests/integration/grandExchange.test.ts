import { calcPercentOfNum, randArrItem } from 'e';
import { Bank } from 'oldschooljs';
import { afterAll, describe, expect, test } from 'vitest';

import { usernameCache } from '../../src/lib/constants';
import { GrandExchange } from '../../src/lib/grandExchange';
import { prisma } from '../../src/lib/settings/prisma';
import { mahojiClientSettingsFetch } from '../../src/lib/util/clientSettings';
import resolveItems from '../../src/lib/util/resolveItems';
import { geCommand } from '../../src/mahoji/commands/ge';
import { createTestUser, mockClient, TestUser } from './util';

const sampleBank = new Bank().add('Coins', 1_000_000_000).add('Egg', 1000).add('Coal', 1000).add('Trout', 1000);

async function cancelAllListings(user: TestUser) {
	const results: string[] = [];
	const activeListings = await prisma.gEListing.findMany({
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
	await mockClient();
	const ticker = setInterval(() => GrandExchange.tick(), 100);
	const users: TestUser[] = [];
	let amountOfUsers = 20;

	for (let i = 0; i < amountOfUsers; i++) {
		const user = await createTestUser();
		await user.addItemsToBank({ items: sampleBank });
		users.push(user);
	}
	const totalExpectedBank = sampleBank.clone().multiply(amountOfUsers);

	const itemPool = resolveItems(['Egg', 'Coal', 'Trout']);

	test('Fuzz', async () => {
		const totalItemsPutIntoGE = new Bank();
		const promises = [];

		// Make the users make lots of random buy/sell requests
		for (const user of users) {
			for (const item of itemPool) {
				const method = randArrItem(['buy', 'sell']);
				const quantity = randArrItem([20, 25, 50]);
				const price = randArrItem([1, 2, 3, 4, 5, 10, 15, 20, 25, 50]);
				promises.push(
					user.runCommand(geCommand, {
						[method]: {
							item,
							quantity,
							price
						}
					})
				);
				if (method === 'buy') {
					totalItemsPutIntoGE.add(item, quantity);
				} else {
					totalItemsPutIntoGE.add('Coins', price * quantity);
				}
			}
		}

		await Promise.all(promises);
		for (const result of promises) {
			expect(await result).toContain('Successfully created');
		}

		const geBank = await GrandExchange.fetchOwnedBank();
		console.log(geBank.toString());

		const activeTransactions = await prisma.gETransaction.findMany({
			where: {
				OR: [
					{
						buy_listing: {
							user_id: {
								in: users.map(u => u.id)
							}
						}
					},
					{
						sell_listing: {
							user_id: {
								in: users.map(u => u.id)
							}
						}
					}
				]
			}
		});

		for (const tx of activeTransactions) totalItemsPutIntoGE.remove('Coins', Number(tx.total_tax_paid));

		if (!totalItemsPutIntoGE.equals(geBank)) {
			throw new Error(
				`GE bank did not match expected bank: The GE Bank has ${geBank.toString()}, but we expected ${totalItemsPutIntoGE.toString()}`
			);
		}

		await GrandExchange.tick();
		expect(await prisma.gETransaction.count()).toBeGreaterThan(0);
		expect(await prisma.gEListing.count()).toBeGreaterThan(0);

		const activeListings = await GrandExchange.fetchActiveListings();
		expect(activeListings.buyListings.length).toEqual(0);
		expect(activeListings.sellListings.length).toEqual(0);

		const allBanks = new Bank();
		for (const user of users) {
			allBanks.add(user.bankWithGP);
		}
		if (!allBanks.equals(totalExpectedBank)) {
			throw new Error(`Banks did not match initial banks: ${allBanks.difference(totalExpectedBank).toString()}`);
		}
	});

	test('Refund issue', async () => {
		const wes = await createTestUser();
		const magnaboy = await createTestUser();

		usernameCache.set(wes.id, 'Wes');
		usernameCache.set(magnaboy.id, 'Magnaboy');

		await magnaboy.addItemsToBank({ items: sampleBank });
		await wes.addItemsToBank({ items: sampleBank });

		await magnaboy.runCommand(geCommand, {
			buy: {
				item: 'egg',
				quantity: 100,
				price: 100
			}
		});
		expect(await prisma.gEListing.count()).toBe(1);

		await wes.runCommand(geCommand, {
			sell: {
				item: 'egg',
				quantity: 50,
				price: 50
			}
		});
		expect(await prisma.gEListing.count()).toBe(2);

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

		expect(await cancelAllListings(wes)).toEqual('You cannot cancel a listing that has already been fulfilled.');
		expect(await cancelAllListings(magnaboy)).toEqual(
			'Successfully cancelled your listing, you have been refunded 5,000x Coins.'
		);

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

		const clientSettings = await mahojiClientSettingsFetch({
			grand_exchange_tax_bank: true,
			grand_exchange_total_tax: true
		});

		expect(Number(clientSettings.grand_exchange_tax_bank)).toEqual(totalTax);
		expect(Number(clientSettings.grand_exchange_total_tax)).toEqual(totalTax);
	});

	afterAll(() => {
		clearInterval(ticker);
	});
});
