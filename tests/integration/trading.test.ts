import { randArrItem, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import { expect, test } from 'vitest';

import { tradeCommand } from '../../src/mahoji/commands/trade';
import type { TestUser } from './util';
import { createTestUser, mockClient } from './util';

test('Trade consistency', async () => {
	await mockClient();

	const bank = new Bank().add('Coins', 1000).add('Egg', 1000).add('Coal', 1000).add('Trout', 1000).freeze();
	const NUMBER_OF_USERS = 20;

	let users: TestUser[] = [];
	for (let i = 0; i < NUMBER_OF_USERS; i++) {
		users.push(createTestUser(bank) as any);
	}
	users = await Promise.all(users);

	function checkMatch() {
		const expectedBank = bank.clone().multiply(NUMBER_OF_USERS);
		const actualBank = new Bank();
		for (const u of users) actualBank.add(u.bankWithGP);
		if (!actualBank.equals(expectedBank)) {
			throw new Error(`Expected bank to match, difference: ${actualBank.difference(expectedBank)}`);
		}
	}

	checkMatch();

	const promises = [];

	for (let i = 0; i < 3; i++) {
		for (const user of shuffleArr(users)) {
			const other = randArrItem(users);
			const method = randArrItem(['send', 'receive', 'both']);
			if (other === user) continue;

			const options: any = {
				userID: user.id,
				guildID: '123',
				user,
				options: {
					user: {
						user: other
					}
				}
			};

			switch (method) {
				case 'both': {
					options.options.send = user.randomBankSubset().toString();
					options.options.receive = other.randomBankSubset().toString();
					break;
				}
				case 'send': {
					options.options.send = user.randomBankSubset().toString();
					break;
				}
				case 'receive': {
					options.options.receive = other.randomBankSubset().toString();
					break;
				}
			}

			promises.push(tradeCommand.run(options));
		}

		checkMatch();
		await Promise.all(promises);
		checkMatch();
		expect(
			await global.prisma!.economyTransaction.count({
				where: {
					sender: {
						in: users.map(u => BigInt(u.id))
					}
				}
			})
		).toBeGreaterThan(1);
	}

	checkMatch();
});
