import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const Pools: PoHObject[] = [
	{
		id: 29_237,
		name: 'Restoration pool',
		slot: 'pool',
		level: 65,
		itemCost: new Bank()
			.add('Limestone brick', 5)
			.add('Bucket of water', 5)
			.add('Soul rune', 1000)
			.add('Body rune', 1000)
	},
	{
		id: 29_238,
		name: 'Revitalisation pool',
		slot: 'pool',
		level: 70,
		itemCost: new Bank().add('Stamina potion(4)', 10),
		requiredInPlace: 29_237
	},
	{
		id: 29_239,
		name: 'Rejuvenation pool',
		slot: 'pool',
		level: 80,
		itemCost: new Bank().add('Prayer potion(4)', 10),
		requiredInPlace: 29_238
	},
	{
		id: 29_240,
		name: 'Fancy rejuvenation pool',
		slot: 'pool',
		level: 85,
		itemCost: new Bank().add('Super restore(4)', 10).add('Marble block', 2),
		requiredInPlace: 29_239
	},
	{
		id: 29_241,
		name: 'Ornate rejuvenation pool',
		slot: 'pool',
		level: 90,
		itemCost: new Bank().add('Anti-venom(4)', 10).add('Gold leaf', 5).add('Blood rune', 1000),
		requiredInPlace: 29_240
	}
];
