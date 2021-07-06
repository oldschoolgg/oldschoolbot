import { itemID, resolveNameBank } from '../../util';
import { Buyable } from './buyables';

// Most prices >=10k are x10, < 10k = x100
export const slayerBuyables: Buyable[] = [
	{
		name: 'Broad arrows',
		outputItems: resolveNameBank({
			'Broad arrows': 1
		}),
		gpCost: 250
	},
	{
		name: 'Broad arrowheads',
		outputItems: resolveNameBank({
			'Broad arrowheads': 1
		}),
		gpCost: 225
	},
	{
		name: 'Broad arrowhead pack',
		gpCost: 22_500,
		outputItems: {
			[itemID('Broad arrowheads')]: 100
		}
	},
	{
		name: 'Unfinished broad bolts',
		outputItems: resolveNameBank({
			'Unfinished broad bolts': 1
		}),
		gpCost: 225
	},
	{
		name: 'Unfinished broad bolt pack',
		gpCost: 22_500,
		outputItems: {
			[itemID('Unfinished broad bolts')]: 100
		}
	},
	{
		name: 'Enchanted gem',
		outputItems: resolveNameBank({
			'Enchanted gem': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Leaf-bladed spear',
		outputItems: resolveNameBank({
			'Leaf-bladed spear': 1
		}),
		gpCost: 310_000
	},
	{
		name: 'Facemask',
		outputItems: resolveNameBank({
			Facemask: 1
		}),
		gpCost: 20_000
	},
	{
		name: 'Earmuffs',
		outputItems: resolveNameBank({
			Earmuffs: 1
		}),
		gpCost: 20_000
	},
	{
		name: 'Nose peg',
		outputItems: resolveNameBank({
			'Nose peg': 1
		}),
		gpCost: 20_000
	},
	{
		name: "Slayer's staff",
		outputItems: resolveNameBank({
			"Slayer's staff": 1
		}),
		gpCost: 210_000
	},
	{
		name: 'Spiny helmet',
		outputItems: resolveNameBank({
			'Spiny helmet': 1
		}),
		gpCost: 65_000
	},
	{
		name: 'Boots of stone',
		outputItems: resolveNameBank({
			'Boots of stone': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Antipoison(4)',
		outputItems: resolveNameBank({
			'Antipoison(4)': 1
		}),
		gpCost: 10_000
	}
];
