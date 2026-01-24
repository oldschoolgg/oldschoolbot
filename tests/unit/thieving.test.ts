import { describe, test } from 'vitest';

import { stealables } from '@/lib/skilling/skills/thieving/stealables.js';

describe('Thieving', () => {
	test('All stealables should have a table', () => {
		for (const entity of stealables) {
			if (!entity.table) {
				throw new Error(`No table for ${entity.name}.`);
			}
		}
	});

	test('All non-pickpocketables should have respawn times', () => {
		for (const entity of stealables) {
			if (entity.type !== 'pickpockable' && !entity.respawnTime) {
				throw new Error(`Missing respawn time for ${entity.name}.`);
			}
		}
	});
});
