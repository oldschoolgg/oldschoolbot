import { ECreature } from 'oldschooljs';
import { expect, test } from 'vitest';

import { minionCommand } from '@/mahoji/commands/minion.js';
import { createTestUser } from '../util.js';

test('incrementCreatureScore', async () => {
	const user = await createTestUser();

	await user.incrementCreatureScore(ECreature.BLACK_CHINCHOMPA);
	expect(await user.getCreatureScore(ECreature.BLACK_CHINCHOMPA)).toEqual(1);

	await user.incrementCreatureScore(ECreature.BLACK_CHINCHOMPA, 10);
	expect(await user.getCreatureScore(ECreature.BLACK_CHINCHOMPA)).toEqual(11);

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

	expect(await user.getCreatureScore(ECreature.BLACK_CHINCHOMPA)).toEqual(11);
	const res = await user.runCommand(minionCommand, { kc: { name: 'Sapphire glacialis' } });
	expect(res).toEqual('Your Sapphire glacialis KC is: 6.');
});
