import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const Teleports: PoHObject[] = [
	{
		id: 29227,
		name: 'Spirit tree',
		slot: 'teleport',
		level: {
			construction: 75,
			farming: 83
		},
		itemCost: new Bank().add('Spirit seed')
	},
	{
		id: 11761,
		name: 'Fairy ring',
		slot: 'teleport',
		level: 85,
		itemCost: new Bank().add('Mushroom', 50).add('Fairy enchantment')
	},
	{
		id: 31554,
		name: 'Obelisk',
		slot: 'teleport',
		level: 80,
		itemCost: new Bank().add('Ancient crystal', 4).add('Marble block', 4)
	},
	{
		id: 29422,
		name: 'Spirit tree and fairy ring',
		slot: 'teleport',
		level: {
			construction: 95,
			farming: 83
		},
		itemCost: new Bank().add('Mushroom', 100).add('Fairy enchantment').add('Spirit seed')
	}
];
