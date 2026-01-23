import { Items } from 'oldschooljs';
import { describe, test } from 'vitest';

import { dryStreakEntities } from '../../src/mahoji/commands/tools.js';

describe('Drystreak', async () => {
	test('Data points', async () => {
		const promises = [];
		for (const a of dryStreakEntities) {
			try {
				promises.push(a.run({ item: Items.getOrThrow(a.items[0]), ironmanOnly: false }));
				promises.push(a.run({ item: Items.getOrThrow(a.items[0]), ironmanOnly: true }));
			} catch (err) {
				throw new Error(`Error running ${a.name}: ${err}`);
			}
		}
		await Promise.all(promises);
	});
});
