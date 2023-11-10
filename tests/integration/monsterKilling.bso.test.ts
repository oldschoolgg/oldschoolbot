import { Bank } from 'oldschooljs';
import { expect, test } from 'vitest';

import { convertStoredActivityToFlatActivity } from '../../src/lib/settings/prisma';
import { Gear } from '../../src/lib/structures/Gear';
import { processPendingActivities } from '../../src/lib/Task';
import { MonsterActivityTaskOptions } from '../../src/lib/types/minions';
import { killCommand } from '../../src/mahoji/commands/k';
import { giveMaxStats } from '../../src/mahoji/commands/testpotato';
import { createTestUser, mockClient } from './util';

test('Killing Vlad', async () => {
	await mockClient();
	const user = await createTestUser();
	const startingBank = new Bank().add('Shark', 1_000_000).add('Vial of blood', 1000).add('Silver stake', 1000);
	await user.addItemsToBank({ items: startingBank });

	const gear = new Gear();
	gear.equip('Abyssal cape');
	gear.equip('Demonic piercer');
	gear.equip('Armadyl crossbow');
	gear.equip('Armadyl platebody');
	gear.equip("Inquisitor's plateskirt");
	gear.equip('Ranger boots');
	gear.equip("Inquisitor's hauberk");
	gear.equip('Dwarven blessing');
	gear.equip('Amulet of torture');
	gear.equip('Silver bolts', 10_000);

	await giveMaxStats(user);
	await user.update({
		gear_range: gear.raw() as any,
		skills_hitpoints: 200_000_000
	});

	await user.runCommand(killCommand, {
		name: 'vladimir drakan'
	});

	const [finishedActivity] = await processPendingActivities();
	const data = convertStoredActivityToFlatActivity(finishedActivity) as MonsterActivityTaskOptions;

	const quantityKilled = data.quantity;
	expect(user.bank.amount('Shark')).toBeLessThan(1_000_000);
	expect(user.bank.amount('Vial of blood')).toEqual(1000 - quantityKilled);
	expect(user.bank.amount('Silver stake')).toEqual(1000 - quantityKilled);
	expect(user.gear.range.ammo!.quantity).toBeLessThan(10_000);
});
