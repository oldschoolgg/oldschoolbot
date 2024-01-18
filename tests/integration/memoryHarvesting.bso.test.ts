import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import { expect, test } from 'vitest';

import { MemoryHarvestType } from '../../src/lib/bso/divination';
import { Gear } from '../../src/lib/structures/Gear';
import { MemoryHarvestOptions } from '../../src/lib/types/minions';
import itemID from '../../src/lib/util/itemID';
import { divinationCommand } from '../../src/mahoji/commands/divination';
import { createTestUser, mockClient } from './util';

test('Memory Harvesting - Convert to XP', async () => {
	await mockClient();
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
	const activity = await user.runActivity<MemoryHarvestOptions>();
	await user.sync();
	expect(user.skillsAsXP.divination).toBeGreaterThan(1);
	expect(user.skillsAsLevels.divination).toEqual(36);
	expect(activity.dp).toEqual(false);
	expect(activity.dh).toEqual(false);
	expect(activity.e).toEqual(itemID('Pale energy'));
	expect(activity.wb).toEqual(false);
	expect(activity.t).toEqual(0);
});

test('Memory Harvesting - Convert to Energy', async () => {
	await mockClient();
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
	const activity = await user.runActivity<MemoryHarvestOptions>();
	await user.sync();
	expect(user.skillsAsXP.divination).toBeGreaterThan(1);
	expect(user.skillsAsLevels.divination).toEqual(32);
	expect(activity.dp).toEqual(false);
	expect(activity.dh).toEqual(false);
	expect(activity.e).toEqual(itemID('Pale energy'));
	expect(activity.wb).toEqual(false);
	expect(activity.t).toEqual(1);
	const stats = await user.fetchStats({ divination_loot: true });
	const divinationLoot = new Bank(stats.divination_loot as ItemBank);
	expect(divinationLoot.amount('Pale energy')).toEqual(960);
	expect(user.bank.amount('Pale energy')).toEqual(960);
});
