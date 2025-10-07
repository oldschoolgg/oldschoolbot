import { Bank } from 'oldschooljs';

import type { Buyable } from '@/lib/data/buyables/buyables.js';

export const circusBuyables: Buyable[] = [
	{
		name: 'Ringmaster set',
		itemCost: new Bank().add('Circus ticket', 500),
		outputItems: new Bank({
			'Ringmaster set': 1
		})
	},
	{
		name: 'Clown set',
		itemCost: new Bank().add('Circus ticket', 200),
		outputItems: new Bank({
			'Clown set': 1
		})
	},
	{
		name: 'Acrobat set',
		itemCost: new Bank().add('Circus ticket', 50),
		outputItems: new Bank({
			'Acrobat set': 1
		})
	}
];
