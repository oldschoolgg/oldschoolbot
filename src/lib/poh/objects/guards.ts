import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const Guards: PoHObject[] = [
	{
		id: 13366,
		name: 'Skeleton guard',
		slot: 'guard',
		level: 70,
		itemCost: new Bank().add('Coins', 250_000)
	},
	{
		id: 13367,
		name: 'Dog guard',
		slot: 'guard',
		level: 74,
		itemCost: new Bank().add('Coins', 400_000)
	},
	{
		id: 13368,
		name: 'Hobgoblin guard',
		slot: 'guard',
		level: 78,
		itemCost: new Bank().add('Coins', 1_000_000)
	},
	{
		id: 13372,
		name: 'Baby red dragon guard',
		slot: 'guard',
		level: 82,
		itemCost: new Bank().add('Coins', 2_000_000)
	},
	{
		id: 13370,
		name: 'Huge spider guard',
		slot: 'guard',
		level: 86,
		itemCost: new Bank().add('Coins', 4_000_000)
	},
	{
		id: 13369,
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
