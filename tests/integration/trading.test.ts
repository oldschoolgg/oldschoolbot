import { cryptoRng } from '@oldschoolgg/rng/crypto';
import { sleep } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { chunk } from 'remeda';
import { expect, test } from 'vitest';

import itemIsTradeable from '../../src/lib/util/itemIsTradeable.js';
import { parseBank } from '../../src/lib/util/parseStringBank.js';
import { tradeCommand } from '../../src/mahoji/commands/trade.js';
import { mockSnowflake } from '../test-utils/misc.js';
import { mockInteraction } from '../test-utils/mockInteraction.js';
import type { TestUser } from './util.js';
import { createTestUser, mockClient, mockUserOption } from './util.js';

test('Trade consistency', async () => {
	await mockClient();

	const bank = new Bank().add('Coins', 1000).add('Egg', 1000).add('Coal', 1000).add('Trout', 1000).freeze();
	const NUMBER_OF_USERS = 18;

	let users: TestUser[] = [];
	for (let i = 0; i < NUMBER_OF_USERS; i++) {
		users.push(createTestUser(bank) as any);
	}
	users = await Promise.all(users);

	async function checkMatch() {
		const expectedBank = bank.clone().multiply(NUMBER_OF_USERS);
		const actualBank = new Bank();
		for (const u of users) {
			await u.sync();
			actualBank.add(u.bankWithGP);
		}
		if (!actualBank.equals(expectedBank)) {
			throw new Error(`Expected bank to match, difference: ${actualBank.difference(expectedBank)}`);
		}
	}

	await checkMatch();

	const promises = [];

	for (const [user1, user2] of chunk(users, 2)) {
		const method = cryptoRng.pick(['send', 'receive', 'both']);

		const options: any = {
			userID: user1.id,
			guildID: '123',
			user: user1,
			options: {
				user: {
					user: user2
				}
			},
			interaction: mockInteraction({ user: user1 })
		};

		switch (method) {
			case 'both': {
				options.options.send = user1.randomBankSubset().toString();
				options.options.receive = user2?.randomBankSubset().toString();
				break;
			}
			case 'send': {
				options.options.send = user1.randomBankSubset().toString();
				break;
			}
			case 'receive': {
				options.options.receive = user2?.randomBankSubset().toString();
				break;
			}
		}

		promises.push(
			(async () => {
				let attempts = 0;
				while (attempts < 100) {
					attempts += 1;
					await Promise.all([user1.sync(), user2?.sync()]);
					const res = await tradeCommand.run({ ...options, guildId: mockSnowflake(cryptoRng) });
					if (typeof res !== 'string' || !res.includes('Trade failed')) {
						break;
					}
					await sleep(150);
				}
				if (attempts === 100) {
					throw new Error('Trade failed 100 times in a row, something is wrong');
				}
			})()
		);
	}

	await Promise.all(promises);
	await checkMatch();
	expect(
		await global.prisma!.economyTransaction.count({
			where: {
				sender: {
					in: users.map(u => BigInt(u.id))
				}
			}
		})
	).toBeGreaterThan(1);

	await checkMatch();
});

test('Trade filter tt should include valid clue/casket items even if item.tradeable is false', async () => {
	await mockClient();

	const senderStartingBank = new Bank()
		.add('Coins', 1_000_000)
		.add('Clue scroll (easy)', 2)
		.add('Reward casket (easy)', 3)
		.add('Clue scroll (grandmaster)', 4);

	const ttItems = parseBank({
		inputBank: senderStartingBank,
		filters: ['tt']
	});

	const nonDefaultTradeableTTItem = ttItems
		.items()
		.find(([item]) => !item.tradeable && itemIsTradeable(item.id, true));
	expect(nonDefaultTradeableTTItem).toBeTruthy();

	const sender = await createTestUser(senderStartingBank);
	const recipient = await createTestUser(new Bank().add('Coins', 1_000_000));

	await sender.runCommand(tradeCommand, { user: mockUserOption(recipient.id), filter: 'tt' });

	await Promise.all([sender.sync(), recipient.sync()]);
	const [targetItem, targetQty] = nonDefaultTradeableTTItem!;

	expect(sender.bank.amount(targetItem.id)).toBe(0);
	expect(recipient.bank.amount(targetItem.id)).toBe(targetQty);
});
