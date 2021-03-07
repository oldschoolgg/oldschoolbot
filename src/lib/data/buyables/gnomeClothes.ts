import { resolveNameBank } from '../../util';
import { Buyable } from './buyables';

export const gnomeClothes: Buyable[] = [
	{
		name: 'Pink boots',
		outputItems: resolveNameBank({
			'Pink boots': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Green boots',
		outputItems: resolveNameBank({
			'Green boots': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Blue boots',
		outputItems: resolveNameBank({
			'Blue boots': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Cream boots',
		outputItems: resolveNameBank({
			'Cream boots': 1
		}),
		gpCost: 100_000
	},
	{
		name: 'Turquoise boots',
		outputItems: resolveNameBank({
			'Turquoise boots': 1
		}),
		gpCost: 100_000
	}
];
