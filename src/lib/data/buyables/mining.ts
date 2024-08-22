import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const miningBuyables: Buyable[] = [
	{
		name: 'Prospector helmet',
		itemCost: new Bank({
			'Golden nugget': 40
		})
	},
	{
		name: 'Prospector jacket',
		itemCost: new Bank({
			'Golden nugget': 60
		})
	},
	{
		name: 'Prospector legs',
		itemCost: new Bank({
			'Golden nugget': 50
		})
	},
	{
		name: 'Prospector boots',
		itemCost: new Bank({
			'Golden nugget': 30
		})
	},
	{
		name: 'Coal bag',
		itemCost: new Bank({
			'Golden nugget': 100
		})
	},
	{
		name: 'Gem bag',
		itemCost: new Bank({
			'Golden nugget': 100
		})
	},
	{
		name: 'Mining gloves',
		itemCost: new Bank({
			'Unidentified minerals': 60
		})
	},
	{
		name: 'Superior mining gloves',
		itemCost: new Bank({
			'Unidentified minerals': 120
		})
	},
	{
		name: 'Expert mining gloves',
		itemCost: new Bank({
			'Superior mining gloves': 1,
			'Mining gloves': 1,
			'Unidentified minerals': 60
		})
	},
	{
		name: 'Bag full of gems',
		itemCost: new Bank({
			'Golden nugget': 40
		})
	},
	{
		name: 'Bag full of gems (minerals)',
		outputItems: new Bank({
			'Bag full of gems': 1
		}),
		itemCost: new Bank({
			'Unidentified minerals': 20
		})
	}
];
