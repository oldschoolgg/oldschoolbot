import { Bank, EItem } from 'oldschooljs';
import { describe, test } from 'vitest';

import { clueCommand } from '../../../src/mahoji/commands/clue.js';
import { openCommand } from '../../../src/mahoji/commands/open.js';
import { mockClient } from '../util';

describe('Actual Clues', async () => {
	const client = await mockClient();

	test('Actual Clues', async ({ expect }) => {
		expect.assertions(6);
		const user = await client.mockUser({
			bank: new Bank().add(EItem.CLUE_SCROLL_BEGINNER, 10),
			maxed: true
		});

		await user.runCommand(clueCommand, {
			tier: 'beginner',
			quantity: 2
		});
		await user.runActivity();
		const counters = await prisma.userCounter.findMany({
			where: {
				user_id: BigInt(user.id),
				key: 'cluecompletions.beginner'
			}
		});
		expect(counters.length).toEqual(1);
		expect(counters[0].value.toNumber()).toEqual(2);

		await expect((await user.calcActualClues()).clueCounts.Beginner).toEqual(0);

		await user.addItemsToCollectionLog(new Bank().add(EItem.CLUE_SCROLL_BEGINNER, 10));

		await expect((await user.calcActualClues()).clueCounts.Beginner).toEqual(0);

		await user.runCommand(openCommand, {
			name: 'reward casket (beginner)',
			quantity: 2
		});

		const newClues = await user.calcActualClues();
		expect(newClues.clueCounts.Beginner).toEqual(2);
		expect(newClues.clueCounts.Easy).toEqual(0);
	});
});
