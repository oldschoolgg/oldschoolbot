import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const stealingCreationBuyables: Buyable[] = [
	{
		name: "Fletcher's skilling outfit",
		itemCost: new Bank({
			'Stealing creation token': 160
		}),
		outputItems: new Bank({
			"Fletcher's gloves": 1,
			"Fletcher's boots": 1,
			"Fletcher's top": 1,
			"Fletcher's hat": 1,
			"Fletcher's legs": 1
		})
	},
	{
		name: "Fletcher's gloves",
		itemCost: new Bank({
			'Stealing creation token': 20
		})
	},
	{
		name: "Fletcher's boots",
		itemCost: new Bank({
			'Stealing creation token': 20
		})
	},
	{
		name: "Fletcher's top",
		itemCost: new Bank({
			'Stealing creation token': 50
		})
	},
	{
		name: "Fletcher's hat",
		itemCost: new Bank({
			'Stealing creation token': 30
		})
	},
	{
		name: "Fletcher's legs",
		itemCost: new Bank({
			'Stealing creation token': 40
		})
	}
];
