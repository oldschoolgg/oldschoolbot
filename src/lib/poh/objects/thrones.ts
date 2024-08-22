import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const Thrones: PoHObject[] = [
	{
		id: 13_665,
		name: 'Oak throne',
		slot: 'throne',
		level: 60,
		itemCost: new Bank().add('Oak plank', 5).add('Marble block', 1)
	},
	{
		id: 13_666,
		name: 'Teak throne',
		slot: 'throne',
		level: 67,
		itemCost: new Bank().add('Teak plank', 5).add('Marble block', 2)
	},
	{
		id: 13_667,
		name: 'Mahogany throne',
		slot: 'throne',
		level: 74,
		itemCost: new Bank().add('Mahogany plank', 5).add('Marble block', 3)
	},
	{
		id: 13_668,
		name: 'Gilded throne',
		slot: 'throne',
		level: 81,
		itemCost: new Bank().add('Mahogany plank', 5).add('Marble block', 2).add('Gold leaf', 3)
	},
	{
		id: 13_669,
		name: 'Skeleton throne',
		slot: 'throne',
		level: 88,
		itemCost: new Bank().add('Magic stone', 5).add('Marble block', 4).add('Bones', 5).add('Skull')
	},
	{
		id: 13_670,
		name: 'Crystal throne',
		slot: 'throne',
		level: 95,
		itemCost: new Bank().add('Magic stone', 15)
	},
	{
		id: 13_671,
		name: 'Demonic throne',
		slot: 'throne',
		level: 99,
		itemCost: new Bank().add('Magic stone', 25)
	}
];
