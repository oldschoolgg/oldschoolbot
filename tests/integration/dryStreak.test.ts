import { describe, test } from 'vitest';

import getOSItem from '../../src/lib/util/getOSItem';
import { dryStreakEntities } from '../../src/mahoji/commands/tools';

describe('Drystreak', async () => {
	test('Data points', async () => {
		for (const a of dryStreakEntities) {
			const normal = await a.run({ item: getOSItem(a.items[0]), ironmanOnly: false });
			const iron = await a.run({ item: getOSItem(a.items[0]), ironmanOnly: true });

			const checks = [normal, iron];
			for (const result of checks) {
				if (Array.isArray(result) && result.length > 0 && 'expected' in result[0]) {
					expect(typeof (result[0] as any).expected).toBe('number');
				}
			}
		}
	});
});
