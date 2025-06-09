import { Bank } from 'oldschooljs';
import { convertLVLtoXP } from 'oldschooljs/dist/util';
import { beforeEach, describe, expect, test } from 'vitest';

import { QuestID } from '../../../src/lib/minions/data/quests';
import {
	MasteringMixologyContractStartCommand,
	MixologyPasteCreationCommand
} from '../../../src/mahoji/lib/abstracted_commands/masteringMixologyCommand';
import { createTestUser, mockClient } from '../util';

describe('Mastering Mixology', async () => {
	const client = await mockClient();
	const user = await createTestUser();

	beforeEach(async () => {
		await user.reset();
		await client.reset();
	});

	test('Create paste and complete contract', async () => {
		await user.update({
			skills_herblore: convertLVLtoXP(99),
			finished_quest_ids: { push: QuestID.ChildrenOfTheSun }
		});
		await user.addItemsToBank({ items: new Bank().add('Guam leaf', 3) });

		const createRes = await MixologyPasteCreationCommand(user, '1', 'Guam leaf', 3);
		expect(createRes).toContain('create 30x Mox paste');

		await user.processActivities(client);
		await user.bankAmountMatch('Mox paste', 30);

		const startRes = await MasteringMixologyContractStartCommand(user, '1', 1);
		expect(startRes).toContain('now attempting 1 Mastering Mixology contract');

		await user.processActivities(client);
		await user.bankAmountMatch('Mox paste', 0);
	});
});
