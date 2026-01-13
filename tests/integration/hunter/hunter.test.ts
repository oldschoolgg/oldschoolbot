import { ECreature } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { minionCommand } from '@/mahoji/commands/minion.js';
import { createTestUser } from '../util.js';

describe('Hunter', { retry: 2 }, () => {
	test('Hunter Trip', async () => {
		const user = await createTestUser();

		await user.setLevel('hunter', 99);

		const res = await user.runCmdAndTrip('hunt', { name: 'Red salamander' });
		expect(res.commandResult).toContain('is now net trapping');
		const amount = user.bank.amount('Red salamander');
		expect(await user.getCreatureScore(ECreature.RED_SALAMANDER)).toEqual(amount);

		const res2 = await user.runCmdAndTrip('hunt', { name: 'Red salamander' });
		expect(res2.commandResult).toContain('is now net trapping');
		const amount2 = user.bank.amount('Red salamander');
		expect(await user.getCreatureScore(ECreature.RED_SALAMANDER)).toEqual(amount2);
	});

	test('incrementCreatureScore', async () => {
		const user = await createTestUser();

		await user.incrementCreatureScore(ECreature.BLACK_CHINCHOMPA, 3);
		expect(await user.getCreatureScore(ECreature.BLACK_CHINCHOMPA)).toEqual(3);

		await user.incrementCreatureScore(ECreature.BLACK_CHINCHOMPA, 10);
		expect(await user.getCreatureScore(ECreature.BLACK_CHINCHOMPA)).toEqual(13);

		const creatures = [
			ECreature.SAPPHIRE_GLACIALIS,
			ECreature.CERULEAN_TWITCH,
			ECreature.MANIACAL_MONKEY,
			ECreature.SWAMP_LIZARD,
			ECreature.SNOWY_KNIGHT,
			ECreature.RUBY_HARVEST
		];
		await Promise.all([
			...creatures.map(id => user.incrementCreatureScore(id, 3)),
			...creatures.map(id => user.incrementCreatureScore(id, 3))
		]);

		for (const id of creatures) {
			expect(await user.getCreatureScore(id)).toEqual(6);
		}

		expect(await user.getCreatureScore(ECreature.BLACK_CHINCHOMPA)).toEqual(13);
		const res = await user.runCommand(minionCommand, { kc: { name: 'Sapphire glacialis' } });
		expect(res).toEqual('Your Sapphire glacialis KC is: 6.');
	});
});
