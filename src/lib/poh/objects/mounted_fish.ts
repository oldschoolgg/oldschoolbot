import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const MountedFish: PoHObject[] = [
	{
		id: 13_488,
		name: 'Mounted bass',
		slot: 'mounted_fish',
		level: 36,
		itemCost: new Bank().add('Big bass').add('Oak plank', 2)
	},
	{
		id: 13_489,
		name: 'Mounted swordfish',
		slot: 'mounted_fish',
		level: 56,
		itemCost: new Bank().add('Big swordfish').add('Teak plank', 2)
	},
	{
		id: 13_490,
		name: 'Mounted shark',
		slot: 'mounted_fish',
		level: 76,
		itemCost: new Bank().add('Big shark').add('Mahogany plank', 2)
	}
];
