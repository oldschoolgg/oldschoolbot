import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const Torches: PoHObject[] = [
	{
		id: 13342,
		name: 'Candles',
		slot: 'torch',
		level: 72,
		itemCost: new Bank().add('Oak plank', 4)
	},
	{
		id: 13341,
		name: 'Torches',
		slot: 'torch',
		level: 84,
		itemCost: new Bank().add('Oak plank', 4)
	},
	{
		id: 13343,
		name: 'Skull torches',
		slot: 'torch',
		level: 94,
		itemCost: new Bank().add('Oak plank', 4).add('Skull', 4)
	}
];
