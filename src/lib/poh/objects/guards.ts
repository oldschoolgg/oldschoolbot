import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const Guards: PoHObject[] = [
	{
		id: 13_366,
		name: 'Skeleton guard',
		slot: 'guard',
		level: 70,
		itemCost: new Bank().add('Coins', 250_000)
	},
	{
		id: 13_367,
		name: 'Dog guard',
		slot: 'guard',
		level: 74,
		itemCost: new Bank().add('Coins', 400_000)
	},
	{
		id: 13_368,
		name: 'Hobgoblin guard',
		slot: 'guard',
		level: 78,
		itemCost: new Bank().add('Coins', 1_000_000)
	},
	{
		id: 13_372,
		name: 'Baby red dragon guard',
		slot: 'guard',
		level: 82,
		itemCost: new Bank().add('Coins', 2_000_000)
	},
	{
		id: 13_370,
		name: 'Huge spider guard',
		slot: 'guard',
		level: 86,
		itemCost: new Bank().add('Coins', 4_000_000)
	},
	{
		id: 13_369,
		name: 'Troll guard',
		slot: 'guard',
		level: 90,
		itemCost: new Bank().add('Coins', 8_000_000)
	},
	{
		id: 2715,
		name: 'Hellhound guard',
		slot: 'guard',
		level: 94,
		itemCost: new Bank().add('Coins', 15_000_000)
	}
];
