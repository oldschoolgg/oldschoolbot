import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const MountedFish: PoHObject[] = [
	{
		id: 13_488,
		name: 'Mounted bass',
		slot: 'mountedFish',
		level: 36,
		itemCost: new Bank().add('Big bass').add('Oak plank', 2)
	},
	{
		id: 13_489,
		name: 'Mounted swordfish',
		slot: 'mountedFish',
		level: 56,
		itemCost: new Bank().add('Big swordfish').add('Teak plank', 2)
	},
	{
		id: 13_490,
		name: 'Mounted shark',
		slot: 'mountedFish',
		level: 76,
		itemCost: new Bank().add('Big shark').add('Mahogany plank', 2)
	}
];
