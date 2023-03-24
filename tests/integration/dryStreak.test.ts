import { describe, test } from 'vitest';

import getOSItem from '../../src/lib/util/getOSItem';
import { dryStreakEntities } from '../../src/mahoji/commands/tools';

describe('Drystreak', async () => {
	test('Data points', async () => {
		for (const a of dryStreakEntities) {
			try {
				await a.run({ item: getOSItem(a.items[0]), ironmanOnly: false });
				await a.run({ item: getOSItem(a.items[0]), ironmanOnly: true });
			} catch (err) {
				throw new Error(`Error running ${a.name}: ${err}`);
			}
		}
	});
});
