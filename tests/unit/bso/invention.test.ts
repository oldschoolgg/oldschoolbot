import { allDisassemblyItems, dissasemblyWeighting } from '@/lib/bso/skills/invention/disassemble.js';
import { DisassemblySourceGroups } from '@/lib/bso/skills/invention/groups/index.js';

import { Items } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

describe('Invention', () => {
	test('Min/max item weighting', () => {
		for (const group of DisassemblySourceGroups.map(i => i.items).flat(2)) {
			expect(group.lvl >= dissasemblyWeighting.min && group.lvl <= dissasemblyWeighting.max).toEqual(true);
		}
	});

	test('Duplicate disassembly items', () => {
		const items = new Set<number>();
		const duplicates: string[] = [];
		for (const item of allDisassemblyItems) {
			if (items.has(item)) {
				duplicates.push(Items.itemNameFromId(item)!);
			}
			items.add(item);
		}
		if (duplicates.length > 0) {
			throw new Error(`Duplicate disassembly items found: ${duplicates.join(', ')}`);
		}
	});
});
