import { describe, test } from 'vitest';

import { allLeagueTasks } from '../../src/lib/leagues/leagues';

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
});
