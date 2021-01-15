import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

const baseBank = () => new Bank().add('Marble block').add('Gold leaf');

export const MountedHeads: PoHObject[] = [
	{
		id: 13486,
		name: 'Mounted Kbd head',
		slot: 'mountedHead',
		level: 78,
		itemCost: baseBank().add('Mahogany plank', 2).add('Gold leaf', 2).add('Kbd heads')
	},
	{
		id: 31977,
		name: "Mounted Vorkath's head",
		slot: 'mountedHead',
		level: 82,
		itemCost: baseBank().add('Mahogany plank', 2).add('Gold leaf', 2).add("Vorkath's head")
	}
];
