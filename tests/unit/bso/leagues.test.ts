import { allLeagueTasks, analyzeLeaguesCompletedTaskIDs, leagueTasks } from '@/lib/bso/leagues/leagues.js';

import { describe, expect, test } from 'vitest';

describe('Leagues', async () => {
	test('No duplicates', async () => {
		const seenIDs = new Set();
		const seenNames = new Set();

		for (const task of allLeagueTasks) {
			if (seenIDs.has(task.id)) throw new Error(`Duplicate ID: ${task.id}`);
			if (seenNames.has(task.name)) throw new Error(`Duplicate name: ${task.name}`);
			seenIDs.add(task.id);
			seenNames.add(task.name);
		}
	});

	test('Duplicate cleanup removes extra tasks and computes point deductions', () => {
		const easyTask = leagueTasks[0].tasks[0];
		const mediumTask = leagueTasks[1].tasks[0];
		const eliteTask = leagueTasks[3].tasks[0];

		const analysis = analyzeLeaguesCompletedTaskIDs([
			easyTask.id,
			easyTask.id,
			mediumTask.id,
			mediumTask.id,
			mediumTask.id,
			eliteTask.id
		]);

		expect(analysis.cleanedTaskIDs).toEqual([easyTask.id, mediumTask.id, eliteTask.id]);
		expect(analysis.duplicateEntriesRemoved).toBe(3);
		expect(analysis.pointsToRemove).toBe(20 + 45 + 45);
		expect(analysis.unknownDuplicateTaskIDs).toEqual([]);
		expect(analysis.duplicatedTasks).toEqual([
			{
				taskID: easyTask.id,
				taskName: easyTask.name,
				count: 2,
				extraCount: 1,
				pointsEach: 20,
				pointsToRemove: 20,
				knownTask: true
			},
			{
				taskID: mediumTask.id,
				taskName: mediumTask.name,
				count: 3,
				extraCount: 2,
				pointsEach: 45,
				pointsToRemove: 90,
				knownTask: true
			}
		]);
	});

	test('Duplicate cleanup tracks unknown duplicate task IDs without point deductions', () => {
		const easyTask = leagueTasks[0].tasks[0];
		const analysis = analyzeLeaguesCompletedTaskIDs([easyTask.id, 999999, 999999]);

		expect(analysis.cleanedTaskIDs).toEqual([easyTask.id, 999999]);
		expect(analysis.duplicateEntriesRemoved).toBe(1);
		expect(analysis.pointsToRemove).toBe(0);
		expect(analysis.unknownDuplicateTaskIDs).toEqual([999999]);
		expect(analysis.duplicatedTasks).toEqual([
			{
				taskID: 999999,
				taskName: 'Unknown task 999999',
				count: 2,
				extraCount: 1,
				pointsEach: 0,
				pointsToRemove: 0,
				knownTask: false
			}
		]);
	});
});
