import { describe, expect, test } from 'vitest';

import { dissasemblyWeighting } from '../../src/lib/invention/disassemble';
import { DisassemblySourceGroups } from '../../src/lib/invention/groups';

describe('Invention', () => {
	test('Min/max item weighting', () => {
		for (const group of DisassemblySourceGroups.map(i => i.items).flat(2)) {
			expect(group.lvl >= dissasemblyWeighting.min && group.lvl <= dissasemblyWeighting.max).toEqual(true);
		}
	});
});
