import { Bank } from 'oldschooljs';

import { Buyable } from './buyables';
import { fistOfGuthixBuyables } from './fistOfGuthixBuyables';
import { stealingCreationBuyables } from './stealingCreationBuyables';

const items = [
	['Castle wars cape (beginner)', 100],
	['Castle wars cape (intermediate)', 500],
	['Castle wars cape (advanced)', 1000],
	['Castle wars cape (expert)', 2500],
	['Castle wars cape (legend)', 5000]
] as const;

export const bsoBuyables: Buyable[] = [
	...items.map(i => ({
		name: i[0],
		outputItems: new Bank({
			[i[0]]: 1
		}),
		itemCost: new Bank({
			'Castle wars ticket': i[1]
		})
	})),
	{
		name: 'Fishbowl helmet',
		outputItems: new Bank({
			'Fishbowl helmet': 1
		}),
		qpRequired: 85,
		gpCost: 500_000
	},
	{
		name: 'Diving apparatus',
		outputItems: new Bank({
			'Diving apparatus': 1
		}),
		qpRequired: 85,
		gpCost: 500_000
	},
	{
		name: "Beginner's tackle box",
		outputItems: new Bank({
			"Beginner's tackle box": 1
		}),
		gpCost: 500_000,
		skillsNeeded: {
			fishing: 50
		}
	},
	{
		name: 'Contest rod',
		outputItems: new Bank({
			'Contest rod': 1
		}),
		gpCost: 500_000,
		skillsNeeded: {
			fishing: 50
		}
	},
	{
		name: 'Rainbow cape',
		outputItems: new Bank({
			'Rainbow cape': 1
		}),
		gpCost: 1_000_000
	},
	...fistOfGuthixBuyables,
	...stealingCreationBuyables
];
