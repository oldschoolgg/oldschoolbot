import { Bank, EItem } from 'oldschooljs';
import { describe, it } from 'vitest';

import { clueCommand } from '../../../src/mahoji/commands/clue.js';
import { mockClient } from '../util';

describe('Clues User Counter', async () => {
	const client = await mockClient();

	it('should create and increment counters for clue completions', async ({ expect }) => {
		expect.assertions(3);
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

		expect((await user.calcActualClues()).clueCounts.Beginner).toEqual(0);
	});
});
