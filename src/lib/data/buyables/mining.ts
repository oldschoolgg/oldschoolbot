import { Bank } from 'oldschooljs';

import type { Buyable } from '@/lib/data/buyables/buyables.js';

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
			'Unidentified minerals': 40
		})
	},
	{
		name: 'Superior mining gloves',
		itemCost: new Bank({
			'Unidentified minerals': 100
		})
	},
	{
		name: 'Expert mining gloves',
		itemCost: new Bank({
			'Superior mining gloves': 1,
			'Mining gloves': 1,
			'Unidentified minerals': 40
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
	},
	{
		name: 'Soft clay pack (minerals)',
		outputItems: new Bank({
			'Soft clay pack': 1
		}),
		itemCost: new Bank({
			'Unidentified minerals': 10
		})
	},
	{
		name: 'Soft clay pack (golden nuggets)',
		outputItems: new Bank({
			'Soft clay pack': 1
		}),
		itemCost: new Bank({
			'Golden nugget': 10
		})
	}
];
