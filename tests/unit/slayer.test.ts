import { writeFileSync } from 'node:fs';
import { ECombatOption } from '@oldschoolgg/schemas';
import { objectEntries } from '@oldschoolgg/toolkit';
import { describe, expect, test } from 'vitest';

import type { KillableMonster } from '@/lib/minions/types.js';
import { determineCombatBoosts } from '@/lib/slayer/slayerUtil.js';
import { allSlayerTasks } from '@/lib/slayer/tasks/index.js';
import { SlayerTaskUnlocksEnum } from '../../src/lib/slayer/slayerUnlocks.js';

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

	test('Auto barrage only applies to barrageable monsters on task', () => {
		const monster = {
			canBarrage: true,
			cannonMulti: true
		} as KillableMonster;

		expect(
			determineCombatBoosts({
				cbOpts: [ECombatOption.AlwaysIceBarrage],
				monster,
				isOnTask: false
			})
		).not.toContain('barrage');
		expect(
			determineCombatBoosts({
				cbOpts: [ECombatOption.AlwaysIceBarrage],
				monster,
				isOnTask: true
			})
		).toContain('barrage');
	});
});
