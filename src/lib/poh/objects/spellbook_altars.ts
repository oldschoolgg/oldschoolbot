import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const SpellbookAltars: PoHObject[] = [
	{
		id: 29_147,
		name: 'Ancient altar',
		slot: 'spellbook_altar',
		level: 80,
		itemCost: new Bank()
			.add('Limestone brick', 10)
			.add('Magic stone')
			.add("Pharaoh's sceptre")
			.add('Ancient signet')
	},
	{
		id: 29_148,
		name: 'Lunar altar',
		slot: 'spellbook_altar',
		level: 80,
		itemCost: new Bank()
			.add('Limestone brick', 10)
			.add('Magic stone')
			.add('Astral rune', 10_000)
			.add('Lunar signet')
	},
	{
		id: 29_149,
		name: 'Dark altar',
		slot: 'spellbook_altar',
		level: 80,
		itemCost: new Bank()
			.add('Limestone brick', 10)
			.add('Magic stone')
			.add('Astral rune', 5000)
			.add('Soul rune', 5000)
			.add('Arceuus signet')
	},
	{
		id: 31_858,
		name: 'Occult altar',
		slot: 'spellbook_altar',
		level: 90,
		itemCost: new Bank()
			.add('Limestone brick', 10)
			.add('Magic stone')
			.add('Blood rune', 5000)
			.add('Soul rune', 5000)
			.add('Astral rune', 10_000)
			.add('Arceuus signet')
			.add('Lunar signet'),
		requiredInPlace: 29_147
	}
];
