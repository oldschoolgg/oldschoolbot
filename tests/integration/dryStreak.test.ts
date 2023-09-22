import { Time } from 'e';
import { describe, test } from 'vitest';

import getOSItem from '../../src/lib/util/getOSItem';
import { dryStreakEntities } from '../../src/mahoji/commands/tools';

describe('Drystreak', async () => {
	test(
		'Data points',
		async () => {
			const promises = [];
			for (const a of dryStreakEntities) {
				try {
					for (const item of a.items) {
						promises.push(a.run({ item: getOSItem(item), ironmanOnly: false }));
						promises.push(a.run({ item: getOSItem(item), ironmanOnly: true }));
					}
				} catch (err) {
					throw new Error(`Error running ${a.name}: ${err}`);
				}
			}
			await Promise.all(promises);
		},
		{ timeout: 2 * Time.Minute }
	);
});
