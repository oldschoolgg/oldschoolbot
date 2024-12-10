import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const fistOfGuthixBuyables: Buyable[] = [
	{
		name: 'Rune spikeshield',
		itemCost: new Bank().add('Fist of guthix token', 100),
		outputItems: new Bank({
			'Rune spikeshield': 1
		})
	},
	{
		name: 'Rune berserker shield',
		itemCost: new Bank().add('Fist of guthix token', 150),
		outputItems: new Bank({
			'Rune berserker shield': 1
		})
	},
	{
		name: 'Adamant spikeshield',
		itemCost: new Bank().add('Fist of guthix token', 100),
		outputItems: new Bank({
			'Adamant spikeshield': 1
		})
	},
	{
		name: 'Adamant berserker shield',
		itemCost: new Bank().add('Fist of guthix token', 150),
		outputItems: new Bank({
			'Adamant berserker shield': 1
		})
	},
	{
		name: 'Guthix engram',
		itemCost: new Bank().add('Fist of guthix token', 500),
		outputItems: new Bank({
			'Guthix engram': 1
		})
	}
];
