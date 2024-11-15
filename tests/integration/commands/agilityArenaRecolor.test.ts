import { Bank } from 'oldschooljs';
import { beforeEach, describe, expect, test } from 'vitest';

import { agilityArenaBuyCommand } from '../../../src/mahoji/lib/abstracted_commands/agilityArenaCommand';
import { createTestUser, mockClient } from '../util';

describe('Agility Arena Command', async () => {
	const client = await mockClient();
	const user = await createTestUser();

	beforeEach(async () => {
		await user.reset();
		await client.reset();
	});

	test('Buy brimhaven graceful recolour', async () => {
		await user.addItemsToBank({
			items: new Bank()
				.add('Brimhaven voucher', 250)
				.add('Graceful hood')
				.add('Graceful top')
				.add('Graceful legs')
				.add('Graceful gloves')
				.add('Graceful boots')
				.add('Graceful cape')
		});

		const response = await agilityArenaBuyCommand(user, 'Graceful outfit Recolour');
		expect(response).toBe('Successfully purchased 1x Graceful outfit Recolour for 250x Brimhaven vouchers.');

		await user.bankMatch(
			new Bank()
				.add('Brimhaven graceful hood')
				.add('Brimhaven graceful top')
				.add('Brimhaven graceful legs')
				.add('Brimhaven graceful gloves')
				.add('Brimhaven graceful boots')
				.add('Brimhaven graceful cape')
		);
		await user.clMatch(
			new Bank()
				.add('Brimhaven graceful hood')
				.add('Brimhaven graceful top')
				.add('Brimhaven graceful legs')
				.add('Brimhaven graceful gloves')
				.add('Brimhaven graceful boots')
				.add('Brimhaven graceful cape')
		);
	});
});
