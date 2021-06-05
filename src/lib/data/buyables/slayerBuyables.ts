import { resolveNameBank } from '../../util';
import { Buyable } from './buyables';

// Most prices >=10k are x10, < 10k = x100
export const slayerBuyables: Buyable[] = [
	{
		name: 'Enchanted gem',
		outputItems: resolveNameBank({
			'Enchanted gem': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Mirror shield',
		outputItems: resolveNameBank({
			'Mirror shield': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Leaf-bladed spear',
		outputItems: resolveNameBank({
			'Leaf-bladed spear': 1
		}),
		gpCost: 310_000
	},
	{
		name: 'Bag of salt',
		outputItems: resolveNameBank({
			'Bag of salt': 1
		}),
		gpCost: 1000
	},
	{
		name: 'Rock hammer',
		outputItems: resolveNameBank({
			'Rock hammer': 1
		}),
		gpCost: 50_000
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
		name: 'Fishing explosive',
		outputItems: resolveNameBank({
			'Fishing explosive': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Ice cooler',
		outputItems: resolveNameBank({
			'Ice cooler': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Slayer gloves',
		outputItems: resolveNameBank({
			'Slayer gloves': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Unlit bug lantern',
		outputItems: resolveNameBank({
			'Lit bug lantern': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Lit bug lantern',
		outputItems: resolveNameBank({
			'Lit bug lantern': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Insulated boots',
		outputItems: resolveNameBank({
			'Insulated boots': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Fungicide spray 10',
		outputItems: resolveNameBank({
			'Fungicide spray 10': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Fungicide spray',
		outputItems: resolveNameBank({
			'Fungicide spray 10': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Witchwood icon',
		outputItems: resolveNameBank({
			'Witchwood icon': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Slayer bell',
		outputItems: resolveNameBank({
			'Slayer bell': 1
		}),
		gpCost: 50_000
	},
	{
		name: 'Boots of stone',
		outputItems: resolveNameBank({
			'Boots of stone': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Reinforced goggles',
		outputItems: resolveNameBank({
			'Reinforced goggles': 1
		}),
		gpCost: 50_000,
		qpRequired: 20
	}
];
