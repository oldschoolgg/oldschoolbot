import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

const baseBank = () => new Bank().add('Marble block').add('Gold leaf');

export const MountedHeads: PoHObject[] = [
	{
		id: 13_486,
		name: 'Mounted Kbd head',
		slot: 'mounted_head',
		level: 78,
		itemCost: baseBank().add('Mahogany plank', 2).add('Gold leaf', 2).add('Kbd heads')
	},
	{
		id: 31_977,
		name: "Mounted Vorkath's head",
		slot: 'mounted_head',
		level: 82,
		itemCost: baseBank().add('Mahogany plank', 2).add('Gold leaf', 2).add("Vorkath's head")
	}
];
