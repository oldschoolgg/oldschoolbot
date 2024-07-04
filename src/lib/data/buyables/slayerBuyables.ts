import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

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
		gpCost: 100_000
	},
	{
		name: 'Leaf-bladed spear',
		gpCost: 310_000
	},
	{
		name: 'Facemask',
		gpCost: 20_000
	},
	{
		name: 'Earmuffs',
		gpCost: 20_000
	},
	{
		name: 'Nose peg',
		gpCost: 20_000
	},
	{
		name: "Slayer's staff",
		gpCost: 210_000
	},
	{
		name: 'Spiny helmet',
		gpCost: 65_000
	},
	{
		name: 'Boots of stone',
		gpCost: 100_000
	},
	{
		name: 'Antipoison(4)',
		gpCost: 10_000
	}
];
