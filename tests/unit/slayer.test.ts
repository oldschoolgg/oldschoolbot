import { writeFileSync } from 'node:fs';
import { objectEntries } from 'e';
import { describe, expect, test } from 'vitest';

import { SlayerTaskUnlocksEnum } from '../../src/lib/slayer/slayerUnlocks';
import { allSlayerTasks } from '../../src/lib/slayer/tasks';

describe('Slayer', () => {
	test('All slayer task monster lists should contain their main monster id', () => {
		for (const task of allSlayerTasks) {
			expect(task.monsters).toContain(task.monster.id);
		}
	});

	test('Snapshot the values of the slayer unlocks enum', () => {
		const copy = { ...SlayerTaskUnlocksEnum };
		for (const [key, value] of objectEntries(copy)) {
			if (typeof value === 'string') {
				delete copy[key];
			}
		}
		writeFileSync('./tests/unit/snapshots/slayerUnlocks.snapshot.json', `${JSON.stringify(copy, null, '	')}\n`);
	});
});
