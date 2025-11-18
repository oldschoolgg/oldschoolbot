import { MathRNG } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Monsters } from 'oldschooljs';
import { expect, test } from 'vitest';

import { Gear } from '@/lib/structures/Gear.js';
import type { MonsterActivityTaskOptions } from '@/lib/types/minions.js';
import { monsterTask } from '@/tasks/minions/monsterActivity.js';
import { createTestUser, mockClient } from '../util.js';

test('calculateGearLostOnDeathWilderness', async () => {
	await mockClient();
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

	await monsterTask.run(
		{
			type: 'MonsterKilling',
			mi: Monsters.Venenatis.id,
			q: 10,
			died: true,
			pkEncounters: 3,
			hasWildySupplies: true,
			userID: user.id,
			duration: Time.Hour,
			id: 123,
			finishDate: Date.now(),
			channelId: ''
		} as MonsterActivityTaskOptions,
		{ user, handleTripFinish: async () => { }, rng: MathRNG }
	);

	await user.sync();
	expect(user.gear.wildy.toString()).toEqual("Abyssal cape, Inquisitor's plateskirt, Ignis ring");
	expect(user.bank.has('Hellfire bow (broken)')).toEqual(true);
});
