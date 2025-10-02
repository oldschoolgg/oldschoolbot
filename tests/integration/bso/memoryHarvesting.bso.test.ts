import { Bank, type ItemBank, itemID } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { MemoryHarvestType } from '../../../src/lib/bso/divination.js';
import { Gear } from '../../../src/lib/structures/Gear.js';
import type { MemoryHarvestOptions } from '../../../src/lib/types/minions.js';
import { divinationCommand } from '../../../src/mahoji/commands/divination.js';
import { createTestUser, mockClient } from '../util.js';

describe('Divination', async () => {
	await mockClient();

	const ogRandom = Math.random;

	beforeEach(() => {
		Math.random = () => 0.2;
	});
	afterEach(() => {
		Math.random = ogRandom;
	});

	test('Memory Harvesting - Convert to XP', async () => {
		const user = await createTestUser();
		const gear = new Gear();
		await user.update({
			gear_skilling: gear.raw() as any
		});
		await user.runCommand(divinationCommand, {
			harvest_memories: {
				energy: 'Pale'
			}
		});
		await user.runActivity();
		await user.sync();
		const _activity = await prisma.activity.findFirst({
			where: {
				user_id: BigInt(user.id),
				type: 'MemoryHarvest'
			}
		});
		const activity = ActivityManager.convertStoredActivityToFlatActivity(_activity!) as MemoryHarvestOptions;
		expect(user.skillsAsXP.divination).toBeGreaterThan(1);
		expect(user.skillsAsLevels.divination).toEqual(36);
		expect(activity.dp).toEqual(false);
		expect(activity.dh).toEqual(false);
		expect(activity.e).toEqual(itemID('Pale energy'));
		expect(activity.wb).toEqual(false);
		expect(activity.t).toEqual(0);
	});

	test('Memory Harvesting - Convert to Energy', async () => {
		const user = await createTestUser();
		const gear = new Gear();
		await user.update({
			gear_skilling: gear.raw() as any
		});
		await user.runCommand(divinationCommand, {
			harvest_memories: {
				energy: 'Pale',
				type: MemoryHarvestType.ConvertToEnergy
			}
		});
		await user.runActivity();
		await user.sync();
		const _activity = await prisma.activity.findFirst({
			where: {
				user_id: BigInt(user.id),
				type: 'MemoryHarvest'
			}
		});
		const activity = ActivityManager.convertStoredActivityToFlatActivity(_activity!) as MemoryHarvestOptions;
		expect(user.skillsAsXP.divination).toBeGreaterThan(1);
		expect(user.skillsAsLevels.divination).toEqual(32);
		expect(activity.dp).toEqual(false);
		expect(activity.dh).toEqual(false);
		expect(activity.e).toEqual(itemID('Pale energy'));
		expect(activity.wb).toEqual(false);
		expect(activity.t).toEqual(1);
		const stats = await user.fetchStats();
		const divinationLoot = new Bank(stats.divination_loot as ItemBank);
		expect(divinationLoot.amount('Pale energy')).toEqual(960);
		expect(user.bank.amount('Pale energy')).toEqual(960);
	});
});
