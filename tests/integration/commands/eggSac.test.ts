import { sleep } from 'e';
import { Bank } from 'oldschooljs';
import { beforeEach, describe, test } from 'vitest';

import { offerCommand } from '../../../src/mahoji/commands/offer';
import { randomMock } from '../setup';
import { createTestUser } from '../util';

describe('Egg Sac Command', async () => {
	const user = await createTestUser();

	beforeEach(async () => {
		await user.reset();
	});

	test('Basic test', async () => {
		randomMock();

		// const result = await user.runCommand(offerCommand, { name: 'green bird egg' });
		// expect(result).toEqual("You don't own any of these eggs.");

		// await user.addItemsToBank({ items: new Bank().add('Green bird egg', 100) });
		// const result2: any = await user.runCommand(offerCommand, { name: 'green bird egg' });
		// expect(result2.content).contains(
		// 	'You offered 100x Green bird egg to the Shrine and received the attached loot and You received 10,000 <:prayer:630911040426868746> XP'
		// );

		// Run it twice at once
		await user.addItemsToBank({ items: new Bank().add('Green bird egg', 1) });
		user.runCommand(offerCommand, { name: 'green bird egg' }).then(console.log);
		user.runCommand(offerCommand, { name: 'green bird egg' }).then(console.log);
		await sleep(5000);
	});
});
