import { dissasemblyWeighting } from '@/lib/bso/skills/invention/disassemble.js';
import { DisassemblySourceGroups } from '@/lib/bso/skills/invention/groups/index.js';

import { describe, expect, test } from 'vitest';

describe('Invention', () => {
	test('Min/max item weighting', () => {
		for (const group of DisassemblySourceGroups.map(i => i.items).flat(2)) {
			expect(group.lvl >= dissasemblyWeighting.min && group.lvl <= dissasemblyWeighting.max).toEqual(true);
		}
	});
});
