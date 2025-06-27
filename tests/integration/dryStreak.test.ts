import { describe, test } from 'vitest';

import getOSItem from '../../src/lib/util/getOSItem';
import { dryStreakEntities } from '../../src/mahoji/commands/tools';

describe('Drystreak', async () => {
	test('Data points', async () => {
		const promises = [];
		for (const a of dryStreakEntities) {
			try {
				promises.push(a.run({ item: getOSItem(a.items[0]), ironmanOnly: false }));
				promises.push(a.run({ item: getOSItem(a.items[0]), ironmanOnly: true }));
			} catch (err) {
				throw new Error(`Error running ${a.name}: ${err}`);
			}
		}
		await Promise.all(promises);
	});
});
