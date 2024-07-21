import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const mairinsMarketBuyables: Buyable[] = [
	{
		name: 'Unidentified small fossil',
		itemCost: new Bank({
			"Mermaid's tear": 100
		})
	},
	{
		name: 'Unidentified medium fossil',
		itemCost: new Bank({
			"Mermaid's tear": 200
		})
	},
	{
		name: 'Unidentified large fossil',
		itemCost: new Bank({
			"Mermaid's tear": 300
		})
	},
	{
		name: 'Merfolk trident',
		itemCost: new Bank({
			"Mermaid's tear": 400
		})
	},
	{
		name: 'Seaweed spore',
		itemCost: new Bank({
			"Mermaid's tear": 20
		})
	},
	{
		name: 'Bowl of fish',
		itemCost: new Bank({
			"Mermaid's tear": 30
		})
	}
];
