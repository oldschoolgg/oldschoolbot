import { randArrItem, randInt, shuffleArr } from 'e';
import { Bank } from 'oldschooljs';
import { test } from 'vitest';

import { tradeCommand } from '../../src/mahoji/commands/trade';
import { createTestUser, mockClient, TestUser } from './util';

test('Trade consistency', async () => {
	await mockClient();

	const bank = new Bank().add('Coins', 1000).add('Egg', 1000).add('Coal', 1000).add('Trout', 1000).freeze();
	const NUMBER_OF_USERS = 100;

	const users: TestUser[] = [];
	for (let i = 0; i < NUMBER_OF_USERS; i++) {
		users.push(await createTestUser(undefined, bank));
	}

	function checkMatch() {
		const expectedBank = bank.clone().multiply(NUMBER_OF_USERS);
		const actualBank = new Bank();
		for (const u of users) actualBank.add(u.bankWithGP);
		if (!actualBank.equals(expectedBank)) {
			throw new Error(`Expected bank to match, difference: ${actualBank.difference(expectedBank)}`);
		}
	}

	checkMatch();

	for (let i = 0; i < 3; i++) {
		const promises = [];

		for (const user of shuffleArr(users)) {
			const other = randArrItem(users);
			if (other === user) continue;

			const method = i % 2 === 0 ? 'send' : 'receive';
			let items = new Bank();
			for (const [item, qty] of (method === 'send' ? user.bankWithGP : other.bankWithGP).items()) {
				let amnt = randInt(1, qty);
				if (i === 2) {
					amnt = randArrItem([-1, 0, -100_000, 999_999, 999_999_999]);
				}
				items.add(item, randInt(1, amnt));
			}

			const options: any = {
				userID: user.id,
				guildID: '123',
				user,
				options: {
					[method]: items.toString(),
					user: {
						user: other
					}
				}
			};

			promises.push(tradeCommand.run(options));
		}

		checkMatch();
		await Promise.all(promises);
		checkMatch();
	}

	checkMatch();
});
