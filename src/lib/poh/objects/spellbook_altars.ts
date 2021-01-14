import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const SpellbookAltars: PoHObject[] = [
	{
		id: 29147,
		name: 'Ancient altar',
		slot: 'spellbookAltar',
		level: 80,
		itemCost: new Bank()
			.add('Limestone brick', 10)
			.add('Magic stone')
			.add("Pharaoh's sceptre")
			.add('Ancient signet')
	},
	{
		id: 29148,
		name: 'Lunar altar',
		slot: 'spellbookAltar',
		level: 80,
		itemCost: new Bank()
			.add('Limestone brick', 10)
			.add('Magic stone')
			.add('Astral rune', 10_000)
			.add('Lunar signet')
	},
	{
		id: 29149,
		name: 'Dark altar',
		slot: 'spellbookAltar',
		level: 80,
		itemCost: new Bank()
			.add('Limestone brick', 10)
			.add('Magic stone')
			.add('Astral rune', 5000)
			.add('Soul rune', 5000)
			.add('Arceuus signet')
	},
	{
		id: 31858,
		name: 'Occult altar',
		slot: 'spellbookAltar',
		level: 90,
		itemCost: new Bank()
			.add('Limestone brick', 10)
			.add('Magic stone')
			.add('Blood rune', 5000)
			.add('Soul rune', 5000)
			.add('Astral rune', 10_000)
			.add('Arceuus signet')
			.add('Lunar signet'),
		requiredInPlace: 29147
	}
];
