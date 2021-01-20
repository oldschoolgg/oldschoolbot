import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const Prisons: PoHObject[] = [
	{
		id: 13313,
		name: 'Oak cage',
		slot: 'prison',
		level: 65,
		itemCost: new Bank().add('Oak plank', 10).add('Steel bar', 2)
	},
	{
		id: 13319,
		name: 'Steel cage',
		slot: 'prison',
		level: 75,
		itemCost: new Bank().add('Steel bar', 20)
	},
	{
		id: 13322,
		name: 'Spiked cage',
		slot: 'prison',
		level: 80,
		itemCost: new Bank().add('Steel bar', 25)
	},
	{
		id: 13325,
		name: 'Bone cage',
		slot: 'prison',
		level: 85,
		itemCost: new Bank().add('Oak plank', 20).add('Bones', 100)
	}
];
