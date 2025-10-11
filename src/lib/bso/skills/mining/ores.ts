import { itemID, resolveItems } from 'oldschooljs';

import type { Ore } from '@/lib/skilling/types.js';

export const bsoOres: Ore[] = [
	{
		level: 80,
		xp: 1115,
		id: itemID('Obsidian shards'),
		name: 'Obsidian',
		respawnTime: 100,
		bankingTime: 40,
		slope: 0.1,
		intercept: -0.7,
		petChance: 50_000,
		requiredPickaxes: resolveItems(['Crystal pickaxe', 'Dwarven pickaxe', 'Volcanic pickaxe'])
	},
	{
		level: 105,
		xp: 275,
		id: 70_011,
		name: 'Dark animica',
		respawnTime: 4,
		bankingTime: 58,
		slope: 0.188,
		intercept: -3,
		petChance: 30_000,
		clueScrollChance: 46_350
	}
];
