import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const Pools: PoHObject[] = [
	{
		id: 29237,
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
		id: 29238,
		name: 'Revitalisation pool',
		slot: 'pool',
		level: 70,
		itemCost: new Bank().add('Stamina potion(4)', 10),
		requiredInPlace: 29237
	},
	{
		id: 29239,
		name: 'Rejuvenation pool',
		slot: 'pool',
		level: 80,
		itemCost: new Bank().add('Prayer potion(4)', 10),
		requiredInPlace: 29238
	},
	{
		id: 29240,
		name: 'Fancy rejuvenation pool',
		slot: 'pool',
		level: 85,
		itemCost: new Bank().add('Super restore(4)', 10).add('Marble block', 2),
		requiredInPlace: 29239
	},
	{
		id: 29241,
		name: 'Ornate rejuvenation pool',
		slot: 'pool',
		level: 90,
		itemCost: new Bank().add('Anti-venom(4)', 10).add('Gold leaf', 5).add('Blood rune', 1000),
		requiredInPlace: 29240
	},
	{
		id: 99950,
		name: 'Ancient rejuvenation pool',
		slot: 'pool',
		level: 105,
		itemCost: new Bank()
			.add('Saradomin brew(4)', 500)
			.add('Super restore(4)', 150)
			.add('Stamina potion(4)', 100)
			.add('Prayer potion(4)', 200)
			.add('Marble block', 20),
		requiredInPlace: 29241
	}
];
