import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const MountedItems: PoHObject[] = [
	{
		id: 1112,
		name: 'Item mount',
		slot: 'mountedItem',
		level: 99,
		itemCost: new Bank().add('Magic stone', 5)
	}
];
