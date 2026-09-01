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
});
