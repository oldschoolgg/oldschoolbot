import { calcPercentOfNum, randArrItem, shuffleArr, Time } from 'e';
import { Bank } from 'oldschooljs';
import { afterAll, describe, expect, test } from 'vitest';

import { usernameCache } from '../../src/lib/constants';
import { GrandExchange } from '../../src/lib/grandExchange';
import { prisma } from '../../src/lib/settings/prisma';
import { assert } from '../../src/lib/util';
import { gePino } from '../../src/lib/util/logger';
import resolveItems from '../../src/lib/util/resolveItems';
import { geCommand } from '../../src/mahoji/commands/ge';
import { createTestUser, mockClient, TestUser } from './util';

const sampleBank = new Bank()
	.add('Coins', 1_000_000_000)
	.add('Egg', 1000)
	.add('Coal', 1000)
	.add('Trout', 1000)
	.freeze();

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

	const currentOwnedBank = await GrandExchange.fetchOwnedBank();
	expect(currentOwnedBank.toString()).toEqual(new Bank().toString());

	const totalExpectedBank = new Bank();

	let users: TestUser[] = [];
	let amountOfUsers = 100;

	for (let i = 0; i < amountOfUsers; i++) {
		const user = await createTestUser();
		await user.addItemsToBank({ items: sampleBank });
		users.push(user);
		totalExpectedBank.add(sampleBank);
		assert(user.bankWithGP.equals(sampleBank), 'Test users bank should match sample bank');
	}

	const itemPool = resolveItems(['Egg', 'Trout', 'Coal']);

	GrandExchange.calculateSlotsOfUser = async () => ({ slots: 500 } as any);

	test(
		'Fuzz',
		async () => {
			const promises = [];

			users = shuffleArr(users);

			for (let i = 0; i < users.length; i++) {
				for (const item of itemPool) {
					const method = randArrItem(['buy', 'sell']);
					let quantity = randArrItem([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 500]);
					let price = randArrItem([1, 2, 3, 4, 5, 99, 100, 101, 1005, 2005, 3005, 4005, 5005, 100_000]);

					promises.push(
						users[i].runCommand(geCommand, {
							[method]: {
								item,
								quantity,
								price
							}
						})
					);
				}
			}

			for (const result of (await Promise.all(promises)) as string[]) {
				assert(result.includes('Successfully created') || result.includes("You don't own "));
			}

			for (let i = 0; i < 50; i++) {
				await GrandExchange.tick();
				await GrandExchange.checkGECanFullFilAllListings();
				await GrandExchange.extensiveVerification();
			}
			await GrandExchange.tick();

			const testBank = new Bank();
			for (const user of shuffleArr(users)) {
				await cancelAllListings(user);
				await user.sync();
				testBank.add(user.bankWithGP);
			}

			await GrandExchange.checkGECanFullFilAllListings();
			await GrandExchange.extensiveVerification();

			const data = await GrandExchange.fetchData();
			expect(data.isLocked).toEqual(false);
			expect(data.taxBank).toBeGreaterThan(0);
			expect(data.totalTax).toBeGreaterThan(0);

			const totalTaxed = await prisma.gETransaction.aggregate({
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
		},
		{
			repeats: 1,
			timeout: Time.Minute * 5
		}
	);

	test(
		'Refund issue',
		async () => {
			await GrandExchange.totalReset();
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

			expect(await cancelAllListings(wes)).toEqual(
				'You cannot cancel a listing that has already been fulfilled.'
			);
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

			const data = await GrandExchange.fetchData();
			expect(data.taxBank).toEqual(totalTax);
			expect(data.totalTax).toEqual(totalTax);
		},
		{ repeats: 1 }
	);

	afterAll(() => {
		gePino.flush();
	});
});
