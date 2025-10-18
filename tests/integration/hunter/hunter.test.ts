import { expect, test } from 'vitest';

import Hunter from '@/lib/skilling/skills/hunter/hunter.js';
import { minionCommand } from '@/mahoji/commands/minion.js';
import { createTestUser } from '../util.js';

test('incrementCreatureScore', async () => {
	const user = await createTestUser();

	await user.incrementCreatureScore(1);
	expect(await user.getCreatureScore(1)).toEqual(1);

	await user.incrementCreatureScore(1, 10);
	expect(await user.getCreatureScore(1)).toEqual(11);

	const creatures = Hunter.Creatures.slice(10, 20).map(c => c.id);
	await Promise.all([
		...creatures.map(id => user.incrementCreatureScore(id, 3)),
		...creatures.map(id => user.incrementCreatureScore(id, 3))
	]);

	for (const id of creatures) {
		expect(await user.getCreatureScore(id)).toEqual(6);
	}

	expect(await user.getCreatureScore(1)).toEqual(11);
	const res = await user.runCommand(minionCommand, { kc: { name: 'Sapphire glacialis' } });
	expect(res).toEqual('Your Sapphire glacialis KC is: 6.');
});
