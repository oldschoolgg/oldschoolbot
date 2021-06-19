import { Bank } from 'oldschooljs';

import { Buyable } from './buyables';

export const runeBuyables: Buyable[] = [
	{
		name: 'Air rune',
		outputItems: new Bank({
			'Air rune': 1
		}),
		gpCost: 15
	},
	{
		name: 'Earth rune',
		outputItems: new Bank({
			'Earth rune': 1
		}),
		gpCost: 15
	},
	{
		name: 'Water rune',
		outputItems: new Bank({
			'Water rune': 1
		}),
		gpCost: 15
	},
	{
		name: 'Fire rune',
		outputItems: new Bank({
			'Fire rune': 1
		}),
		gpCost: 15
	},
	{
		name: 'Body rune',
		outputItems: new Bank({
			'Body rune': 1
		}),
		gpCost: 20
	},
	{
		name: 'Mind rune',
		outputItems: new Bank({
			'Mind rune': 1
		}),
		gpCost: 25
	}
];
