import itemID from '../../util/itemID';
import { Buyable } from './buyables';

export const runeBuyables: Buyable[] = [
	{
		name: 'Air rune',
		outputItems: {
			[itemID('Air rune')]: 1
		},
		gpCost: 15
	},
	{
		name: 'Earth rune',
		outputItems: {
			[itemID('Earth rune')]: 1
		},
		gpCost: 15
	},
	{
		name: 'Water rune',
		outputItems: {
			[itemID('Water rune')]: 1
		},
		gpCost: 15
	},
	{
		name: 'Fire rune',
		outputItems: {
			[itemID('Fire rune')]: 1
		},
		gpCost: 15
	},
	{
		name: 'Body rune',
		outputItems: {
			[itemID('Body rune')]: 1
		},
		gpCost: 20
	},
	{
		name: 'Mind rune',
		outputItems: {
			[itemID('Mind rune')]: 1
		},
		gpCost: 25
	}
];
