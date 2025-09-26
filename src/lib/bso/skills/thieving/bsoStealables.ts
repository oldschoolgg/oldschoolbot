import { LootTable, Monsters } from 'oldschooljs';

import { KING_GOLDEMAR_GUARD_ID } from '@/lib/bso/bsoConstants.js';
import type { Stealable } from '@/lib/skilling/skills/thieving/stealables.js';

export const bsoStealables: Stealable[] = [
	{
		name: 'Black knight guard',
		type: 'pickpockable',
		level: 75,
		xp: 198.5,
		table: new LootTable()
			.add('Coins', [20, 30])
			.add('Coins', [200, 300])
			.add('Bread')
			.add('Mithril arrow', [1, 16])
			.tertiary(215, 'Dark Temple key'),
		id: Monsters.BlackKnight.id,
		stunTime: 5,
		stunDamage: 1,
		slope: 0.475_65,
		intercept: 0.180_65,
		petChance: 108_718
	},
	{
		name: 'Royal dwarven guard',
		type: 'pickpockable',
		level: 99,
		xp: 95.4,
		aliases: ['royal dwarven guard'],
		table: new LootTable().every('Coins', [985, 1485]).tertiary(100_000, 'Kebab'),
		id: KING_GOLDEMAR_GUARD_ID,
		stunTime: 5,
		stunDamage: 9,
		slope: 0.488_13,
		intercept: 2.065_13,
		petChance: 176_743
	}
];
