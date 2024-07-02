import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const MountedItems: PoHObject[] = [
	{
		id: 1112,
		name: 'Item mount',
		slot: 'mounted_item',
		level: 99,
		itemCost: new Bank().add('Magic stone', 5)
	}
];
