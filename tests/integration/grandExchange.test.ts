import { sleep } from 'e';
import { Bank } from 'oldschooljs';
import { afterAll, beforeEach, describe, expect, test } from 'vitest';

import { usernameCache } from '../../src/lib/constants';
import { GrandExchange } from '../../src/lib/grandExchange';
import { prisma } from '../../src/lib/settings/prisma';
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
	// const users: TestUser[] = [];

	// for (let i = 0; i < 20; i++) {
	// 	const user = await createTestUser();
	// 	await user.addItemsToBank({ items: bank });
	// 	users.push(user);
	// }
	// const totalExpectedBank = bank.clone().multiply(20);

	// const itemPool = resolveItems(['Egg', 'Coal', 'Trout']);

	// test('Fuzz', async () => {
	// 	const promises = [];
	// 	for (const user of users) {
	// 		for (const item of itemPool) {
	// 			const method = randArrItem(['buy', 'sell']);
	// 			const quantity = randArrItem([20, 25, 50]);
	// 			const price = randArrItem([1, 2, 3, 4, 5, 10, 15, 20, 25, 50]);
	// 			promises.push(
	// 				user.runCommand(geCommand, {
	// 					[method]: {
	// 						item,
	// 						quantity,
	// 						price
	// 					}
	// 				})
	// 			);
	// 		}
	// 	}

	// 	await Promise.all(promises);
	// 	await GrandExchange.tick();
	// 	expect(await prisma.gETransaction.count()).toBeGreaterThan(0);
	// 	expect(await prisma.gEListing.count()).toBeGreaterThan(0);

	// 	for (const user of users) {
	//
	// 	}

	// 	const activeListings = await GrandExchange.fetchActiveListings();
	// 	expect(activeListings.buyListings.length).toEqual(0);
	// 	expect(activeListings.sellListings.length).toEqual(0);
	// 	const allBanks = await allUsersBanks();
	// 	console.log(allBanks.difference(totalExpectedBank));
	// 	if (!allBanks.equals(totalExpectedBank)) {
	// 		throw new Error(`Banks did not match initial banks: ${allBanks.difference(totalExpectedBank).toString()}`);
	// 	}
	// 	for (const user of users) {
	// 		console.log(user.bankWithGP.toString());
	// 	}
	// });

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

		expect(await prisma.gETransaction.count()).toBeGreaterThan(0);

		expect(await cancelAllListings(wes)).toEqual('You cannot cancel a listing that has already been fulfilled.');
		expect(await cancelAllListings(magnaboy)).toEqual(
			'Successfully cancelled your listing, you have been refunded 5,000x Coins.'
		);

		expect(wes.bankWithGP.toString()).toEqual('1,000,005,000x Coins, 1,000x Trout, 1,000x Coal, 950x Egg');
		expect(magnaboy.bankWithGP.toString()).toEqual('999,995,000x Coins, 1,050x Egg, 1,000x Trout, 1,000x Coal');

		expect(magnaboy.bankWithGP.clone().add(wes.bankWithGP).toString()).toEqual(
			sampleBank.clone().multiply(2).toString()
		);
	});

	beforeEach(async () => {
		await prisma.gETransaction.deleteMany();
		await prisma.gEListing.deleteMany();
	});

	afterAll(() => {
		clearInterval(ticker);
	});
});
