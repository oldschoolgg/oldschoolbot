import { Bank, convertLVLtoXP } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { SlayerTaskUnlocksEnum } from '../../../src/lib/slayer/slayerUnlocks.js';
import { createCommand } from '../../../src/mahoji/commands/create.js';
import { createTestUser, mockClient } from '../util.js';

describe('Create Command', async () => {
	await mockClient();

	it('suggests creating a missing input when its ingredients are available', async () => {
		const user = await createTestUser(
			new Bank({
				'Black mask (10)': 1,
				Earmuffs: 1,
				Facemask: 1,
				'Nose peg': 1,
				'Spiny helmet': 1,
				'Enchanted gem': 1
			}),
			{
				skills_crafting: convertLVLtoXP(55),
				slayer_unlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade]
			}
		);

		const result = await user.runCommand(createCommand, { item: 'Slayer helmet' });

		expect(result).toContain('You can make a Black mask with `/create item:Uncharged black mask`.');
	});

	it('does not suggest creating inputs for revert actions', async () => {
		const user = await createTestUser(
			new Bank({
				'Black mask': 1,
				Earmuffs: 1,
				Facemask: 1,
				'Spiny helmet': 1,
				'Enchanted gem': 1
			}),
			{
				skills_crafting: convertLVLtoXP(55),
				slayer_unlocks: [SlayerTaskUnlocksEnum.MalevolentMasquerade]
			}
		);

		const result = await user.runCommand(createCommand, { item: 'Revert slayer helmet' });

		expect(result).toBe("You don't have the required items to revert this item. You need: Slayer helmet.");
	});
});
