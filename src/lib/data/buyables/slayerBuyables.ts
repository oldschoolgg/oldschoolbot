import { Bank } from 'oldschooljs';

import { Buyable } from './buyables';

// Most prices >=10k are x10, < 10k = x100
export const slayerBuyables: Buyable[] = [
	{
		name: 'Broad arrows',
		gpCost: 250,
		ironmanPrice: 60
	},
	{
		name: 'Broad arrowheads',
		gpCost: 225,
		ironmanPrice: 55
	},
	{
		name: 'Broad arrowhead pack',
		gpCost: 22_500,
		ironmanPrice: 5500,
		outputItems: new Bank({
			'Broad arrowheads': 100
		})
	},
	{
		name: 'Unfinished broad bolts',
		outputItems: new Bank({
			'Unfinished broad bolts': 1
		}),
		gpCost: 225
	},
	{
		name: 'Unfinished broad bolt pack',
		gpCost: 22_500,
		outputItems: new Bank({
			'Unfinished broad bolts': 100
		})
	},
	{
		name: 'Enchanted gem',
		outputItems: new Bank({
			'Enchanted gem': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Leaf-bladed spear',
		outputItems: new Bank({
			'Leaf-bladed spear': 1
		}),
		gpCost: 310_000
	},
	{
		name: 'Facemask',
		outputItems: new Bank({
			Facemask: 1
		}),
		gpCost: 20_000
	},
	{
		name: 'Earmuffs',
		outputItems: new Bank({
			Earmuffs: 1
		}),
		gpCost: 20_000
	},
	{
		name: 'Nose peg',
		outputItems: new Bank({
			'Nose peg': 1
		}),
		gpCost: 20_000
	},
	{
		name: "Slayer's staff",
		outputItems: new Bank({
			"Slayer's staff": 1
		}),
		gpCost: 210_000
	},
	{
		name: 'Spiny helmet',
		outputItems: new Bank({
			'Spiny helmet': 1
		}),
		gpCost: 65_000
	},
	{
		name: 'Boots of stone',
		outputItems: new Bank({
			'Boots of stone': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Antipoison(4)',
		outputItems: new Bank({
			'Antipoison(4)': 1
		}),
		gpCost: 10_000
	}
];
