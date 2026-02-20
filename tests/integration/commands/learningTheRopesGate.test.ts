import { describe, expect, it } from 'vitest';

import { QuestID } from '../../../src/lib/minions/data/quests.js';
import { createTestUser, mockClient } from '../util.js';

describe('Learning the Ropes gate', async () => {
	await mockClient();

	it('blocks other minion commands before Learning the Ropes is completed', async () => {
		const user = await createTestUser();
		await user.update({ minion_bought_date: new Date() });
		const response = (await user.runCommand('fish', { name: 'shrimps' })) as any;

		expect(response.content).toContain('Before you can use minion commands');
		expect(response.content).toContain('Learning the Ropes');
	});

	it('allows starting Learning the Ropes and unlocks commands after completion', async () => {
		const user = await createTestUser();
		await user.update({ minion_bought_date: new Date() });

		const { commandResult } = await user.runCmdAndTrip('activities', {
			quest: { name: 'Learning the Ropes' }
		});
		expect(commandResult).toContain('is now completing Learning the Ropes');
		expect(user.user.finished_quest_ids).toContain(QuestID.LearningTheRopes);

		const postQuestResponse = await user.runCommand('fish', { name: 'shrimps' });
		expect(postQuestResponse).toContain('is now fishing');
	});

	it('allows minion ironman before Learning the Ropes but still blocks other minion commands', async () => {
		const user = await createTestUser();
		await user.update({ minion_bought_date: new Date() });

		const ironmanResponse = (await user.runCommand('minion', { ironman: {} })) as any;
		expect(ironmanResponse.content).toContain('You are now an ironman.');
		expect(ironmanResponse.content).toContain('Learning the Ropes');
		expect(ironmanResponse.components).toHaveLength(1);

		const blockedResponse = (await user.runCommand('fish', { name: 'shrimps' })) as any;
		expect(blockedResponse.content).toContain('Before you can use minion commands');
		expect(blockedResponse.content).toContain('Learning the Ropes');
	});
});
