import { writeFileSync } from 'node:fs';
import { objectEntries } from '@oldschoolgg/toolkit';
import { Monsters } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { duradelTasks } from '@/lib/slayer/tasks/duradelTasks.js';
import { allSlayerTasks } from '@/lib/slayer/tasks/index.js';
import { konarTasks } from '@/lib/slayer/tasks/konarTasks.js';
import { nieveTasks } from '@/lib/slayer/tasks/nieveTasks.js';
import { SlayerTaskUnlocksEnum } from '../../src/lib/slayer/slayerUnlocks.js';

const metalDragonTaskIDs = [
	Monsters.BronzeDragon.id,
	Monsters.IronDragon.id,
	Monsters.SteelDragon.id,
	Monsters.MithrilDragon.id,
	Monsters.AdamantDragon.id,
	Monsters.RuneDragon.id
];

describe('Slayer', () => {
	test('All slayer task monster lists should contain their main monster id', () => {
		for (const task of allSlayerTasks) {
			expect(task.monsters).toContain(task.monster.id);
		}
	});

	test('Metal dragon tasks are assigned from the bronze dragon task', () => {
		const masters = [
			{ name: 'Konar', tasks: konarTasks, amount: [30, 40], weight: 15 },
			{ name: 'Nieve', tasks: nieveTasks, amount: [30, 40], weight: 12 },
			{ name: 'Duradel', tasks: duradelTasks, amount: [35, 45], weight: 14 }
		] as const;

		for (const master of masters) {
			const metalDragonTasks = master.tasks.filter(task => metalDragonTaskIDs.includes(task.monster.id));
			const assignableMetalDragonTasks = metalDragonTasks.filter(task => task.weight > 0);
			expect(assignableMetalDragonTasks, master.name).toHaveLength(1);
			expect(
				metalDragonTasks
					.filter(task => task.monster.id !== Monsters.BronzeDragon.id)
					.every(task => task.weight === 0)
			).toBe(true);

			const [task] = assignableMetalDragonTasks;
			expect(task.monster.id).toBe(Monsters.BronzeDragon.id);
			expect(task.amount).toEqual(master.amount);
			expect(task.extendedAmount).toEqual([150, 200]);
			expect(task.weight).toBe(master.weight);
			expect(task.extendedUnlockId).toBe(SlayerTaskUnlocksEnum.PedalToTheMetals);
			expect(task.monsters).toEqual(metalDragonTaskIDs);
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
