import { Bank } from 'oldschooljs';

import { itemID } from '../../util';
import { Buyable } from './buyables';

export const miningBuyables: Buyable[] = [
	{
		name: 'Prospector helmet',
		itemCost: {
			[itemID('Golden nugget')]: 40
		}
	},
	{
		name: 'Prospector jacket',
		itemCost: {
			[itemID('Golden nugget')]: 60
		}
	},
	{
		name: 'Prospector legs',
		itemCost: {
			[itemID('Golden nugget')]: 50
		}
	},
	{
		name: 'Prospector boots',
		itemCost: {
			[itemID('Golden nugget')]: 30
		}
	},
	{
		name: 'Coal bag',
		itemCost: {
			[itemID('Golden nugget')]: 100
		}
	},
	{
		name: 'Gem bag',
		itemCost: {
			[itemID('Golden nugget')]: 100
		}
	},
	{
		name: 'Mining gloves',
		itemCost: {
			[itemID('Unidentified minerals')]: 60
		}
	},
	{
		name: 'Superior mining gloves',
		itemCost: {
			[itemID('Unidentified minerals')]: 120
		}
	},
	{
		name: 'Expert mining gloves',
		itemCost: {
			[itemID('Superior mining gloves')]: 1,
			[itemID('Mining gloves')]: 1,
			[itemID('Unidentified minerals')]: 60
		}
	},
	{
		name: 'Bag full of gems',
		itemCost: {
			[itemID('Golden nugget')]: 40
		}
	},
	{
		name: 'Bag full of gems (minerals)',
		outputItems: new Bank({
			'Bag full of gems': 1
		}),
		itemCost: {
			[itemID('Unidentified minerals')]: 20
		}
	}
];
