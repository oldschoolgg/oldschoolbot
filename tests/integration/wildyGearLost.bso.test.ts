import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import { expect, test } from 'vitest';

import { Gear } from '../../src/lib/structures/Gear';
import { monsterTask } from '../../src/tasks/minions/monsterActivity';
import { createTestUser } from './util';

test('calculateGearLostOnDeathWilderness', async () => {
	const user = await createTestUser();

	const gear = new Gear();
	gear.equip('Abyssal cape');
	gear.equip('Demonic piercer');
	gear.equip('Ignis ring');
	gear.equip("Inquisitor's great helm");
	gear.equip("Inquisitor's plateskirt");
	gear.equip('Primordial boots');
	gear.equip("Inquisitor's hauberk");
	gear.equip('Dwarven blessing');
	gear.equip('Amulet of torture');

	await user.update({
		gear_wildy: gear.raw() as any
	});

	await monsterTask.run({
		type: 'MonsterKilling',
		monsterID: Monsters.Venenatis.id,
		quantity: 10,
		died: true,
		pkEncounters: 3,
		hasWildySupplies: true,
		userID: user.id,
		duration: Time.Hour,
		id: 123,
		finishDate: new Date().getTime(),
		channelID: ''
	});

	await user.sync();
	expect(user.gear.wildy.toString()).toEqual("Abyssal cape, Inquisitor's plateskirt, Ignis ring");
	expect(user.bank.has('Hellfire bow (broken)')).toEqual(true);
});
