import { Bank } from 'oldschooljs';
import { convertLVLtoXP } from 'oldschooljs/dist/util';
import { beforeEach, describe, expect, test } from 'vitest';

import { Time } from 'e';
import { QuestID } from '../../../src/lib/minions/data/quests';
import { calcMaxTripLength } from '../../../src/lib/util/calcMaxTripLength';
import {
	MasteringMixologyBuyCommand,
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

	test('Paste creation requires quest and level', async () => {
		await user.update({ skills_herblore: convertLVLtoXP(50) });
		const res1 = await MixologyPasteCreationCommand(user, '1', 'Guam leaf', 1);
		expect(res1).toContain('60 Herblore');

		await user.update({ skills_herblore: convertLVLtoXP(99) });
		const res2 = await MixologyPasteCreationCommand(user, '1', 'Guam leaf', 1);
		expect(res2).toContain('Children of the Sun');

		await user.update({ finished_quest_ids: { push: QuestID.ChildrenOfTheSun } });
	});

	test('Contract respects level requirements', async () => {
		await user.update({
			skills_herblore: convertLVLtoXP(60),
			finished_quest_ids: { push: QuestID.ChildrenOfTheSun }
		});
		await user.addItemsToBank({ items: new Bank().add('Mox paste', 30).add('Lye paste', 30).add('Aga paste', 30) });

		const startXP = user.skillsAsXP.herblore;
		const startRes = await MasteringMixologyContractStartCommand(user, '1', 1);
		expect(startRes).toContain('now attempting 1 Mastering Mixology contract');
		await user.processActivities(client);
		expect(user.skillsAsXP.herblore - startXP).toBe(190);
	});

	test('Cannot start more than max contracts', async () => {
		await user.update({
			skills_herblore: convertLVLtoXP(99),
			finished_quest_ids: { push: QuestID.ChildrenOfTheSun }
		});
		await user.addItemsToBank({ items: new Bank().add('Mox paste', 300) });
		const maxContracts = Math.floor(
			calcMaxTripLength(user, 'MasteringMixologyContract') / ((Time.Hour / 260) * 1.1)
		);
		const res = await MasteringMixologyContractStartCommand(user, '1', maxContracts + 1);
		expect(res).toContain(`${maxContracts} contracts`);
	});

	test('Potion packs require herblore levels', async () => {
		await user.update({
			mixology_mox_points: 10000,
			mixology_aga_points: 10000,
			mixology_lye_points: 10000,
			skills_herblore: convertLVLtoXP(59)
		});
		let res = await MasteringMixologyBuyCommand(user, 'Apprentice potion pack', 1);
		expect(res).toContain('60 Herblore');

		await user.update({ skills_herblore: convertLVLtoXP(60) });
		res = await MasteringMixologyBuyCommand(user, 'Adept potion pack', 1);
		expect(res).toContain('70 Herblore');

		await user.update({ skills_herblore: convertLVLtoXP(70) });
		res = await MasteringMixologyBuyCommand(user, 'Expert potion pack', 1);
		expect(res).toContain('85 Herblore');

		await user.update({ skills_herblore: convertLVLtoXP(90) });
		res = await MasteringMixologyBuyCommand(user, 'Expert potion pack', 1);
		expect(res).toContain('Successfully purchased');
	});
});
