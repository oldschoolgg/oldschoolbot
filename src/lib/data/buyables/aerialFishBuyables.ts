import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const aerialFishBuyables: Buyable[] = [
	{
		name: 'Angler hat',
		itemCost: new Bank({
			'Molch pearl': 100
		})
	},
	{
		name: 'Angler top',
		itemCost: new Bank({
			'Molch pearl': 100
		})
	},
	{
		name: 'Angler waders',
		itemCost: new Bank({
			'Molch pearl': 100
		})
	},
	{
		name: 'Angler boots',
		itemCost: new Bank({
			'Molch pearl': 100
		})
	},
	{
		name: 'Pearl fishing rod',
		itemCost: new Bank({
			'Molch pearl': 100
		})
	},
	{
		name: 'Pearl fly fishing rod',
		itemCost: new Bank({
			'Molch pearl': 120
		})
	},
	{
		name: 'Pearl barbarian rod',
		itemCost: new Bank({
			'Molch pearl': 150
		})
	},
	{
		name: 'Fish sack',
		itemCost: new Bank({
			'Molch pearl': 1000
		})
	}
];
