import { Bank } from 'oldschooljs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
	MasteringMixologyContractStartCommand,
	MixologyPasteCreationCommand
} from '../../../src/mahoji/lib/abstracted_commands/masteringMixologyCommand';
import {
	MasteringMixologyContractTask,
	MixologyPasteCreationTask,
	masteringMixologyWeightedRandom
} from '../../../src/tasks/minions/minigames/masteringMixologyActivity';
import { createTestUser, mockUser } from '../util';

describe('Mastering Mixology', async () => {
	const user = await createTestUser();

	beforeEach(async () => {
		await user.update({
			bank: new Bank().add('Guam leaf', 5).add('Aga paste', 10).add('Mox paste', 10).add('Lye paste', 10),
			skills_herblore: 5_000_000,
			QP: 1,
			finished_quest_ids: [3]
		});
	});

describe('MixologyPasteCreationCommand', () => {
	test('invalid herb', async () => {
		const res = await MixologyPasteCreationCommand(user, '1', 'invalid');
		expect(res).toBe('That is not a valid herb for mixology paste.');
	});

	test('insufficient herb', async () => {
		const u = mockUser({ bank: new Bank(), id: '2' });
		const res = await MixologyPasteCreationCommand(u, '1', 'Guam leaf');
		expect(res).toBe("You don't have any Guam leaf to convert into Mox paste.");
	});

	test('quantity limit', async () => {
		const res = await MixologyPasteCreationCommand(user, '1', 'Guam leaf', 99999);
		expect(res).toContain("can't go on trips longer than");
	});
});

describe('MasteringMixologyContractStartCommand', () => {
	test('missing requirements', async () => {
		const lowUser = mockUser({ skills_herblore: 0, id: '3' });
		const res = await MasteringMixologyContractStartCommand(lowUser as any, '1');
		expect(res).toBe('You need at least 60 Herblore to participate in the mixology.');
	});

	test('missing quest', async () => {
		const noQuest = mockUser({ skills_herblore: 6000000, id: '4' });
		const res = await MasteringMixologyContractStartCommand(noQuest as any, '1');
		expect(res).toContain('You need to complete the "Children of the Sun" quest');
	});

	test('quantity bounds', async () => {
		const res = await MasteringMixologyContractStartCommand(user as any, '1', 0);
		expect(res).toContain('You can only complete between');
	});
});

describe('Tasks', () => {
	test('MixologyPasteCreationTask success', async () => {
		await MixologyPasteCreationTask.run({
			userID: user.id,
			channelID: '1',
			herbName: 'Guam leaf',
			quantity: 1,
			duration: 1,
			type: 'MixologyPasteCreation',
			minigameID: 'mastering_mixology'
		});
		expect(user.bank.amount('Mox paste')).toBeGreaterThan(10);
	});

	test('MasteringMixologyContractTask success', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0);
		await MasteringMixologyContractTask.run({
			userID: user.id,
			channelID: '1',
			quantity: 1,
			type: 'MasteringMixologyContract',
			minigameID: 'mastering_mixology'
		});
		expect(user.bank.amount('Aga paste')).toBeLessThan(10);
	});
});

describe('weightedRandom', () => {
	test('follows weights', () => {
		const items = [
			{ weight: 1, id: 'a' },
			{ weight: 2, id: 'b' },
			{ weight: 3, id: 'c' }
		];
		const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
		for (let i = 0; i < 6000; i++) {
			counts[masteringMixologyWeightedRandom(items).id]++;
		}
		const total = counts.a + counts.b + counts.c;
		expect(counts.c / total).toBeGreaterThan(counts.b / total);
		expect(counts.b / total).toBeGreaterThan(counts.a / total);
	});
});
