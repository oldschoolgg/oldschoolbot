import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const tripBuyables: Buyable[] = [
	{
		name: 'Pineapple',
		outputItems: new Bank().add('Pineapple'),
		gpCost: 5,
		quantityPerHour: 3500,
		shopQuantity: 15,
		changePer: 2
	},
	{
		name: 'Banana',
		outputItems: new Bank().add('Pineapple'),
		gpCost: 5,
		quantityPerHour: 3500,
		shopQuantity: 15,
		changePer: 2
	},
	{
		name: 'Orange',
		outputItems: new Bank().add('Orange'),
		gpCost: 5,
		quantityPerHour: 3250,
		shopQuantity: 10,
		changePer: 2
	},
	{
		name: 'Bucket of sand',
		outputItems: new Bank().add('Bucket of sand'),
		gpCost: 5,
		quantityPerHour: 3250,
		shopQuantity: 10,
		changePer: 2
	},
	{
		name: 'Soda ash',
		outputItems: new Bank().add('Soda ash'),
		gpCost: 5,
		quantityPerHour: 3250,
		shopQuantity: 10,
		changePer: 2
	},
	{
		name: 'Arrow shaft',
		outputItems: new Bank().add('Arrow shaft'),
		gpCost: 1,
		quantityPerHour: 400_000,
		shopQuantity: 1000,
		changePer: 1
	},
	{
		name: 'Copper ore',
		outputItems: new Bank().add('Copper ore'),
		gpCost: 4,
		quantityPerHour: 11000
	},
	{
		name: 'Tin ore',
		outputItems: new Bank().add('Tin ore'),
		gpCost: 4,
		quantityPerHour: 11000
	},
	{
		name: 'Iron ore',
		outputItems: new Bank().add('Iron ore'),
		gpCost: 25,
		quantityPerHour: 11000
	},
	{
		name: 'Mithril ore',
		outputItems: new Bank().add('Mithril ore'),
		gpCost: 243,
		quantityPerHour: 11000
	},
	{
		name: 'Silver ore',
		outputItems: new Bank().add('Silver ore'),
		gpCost: 112,
		quantityPerHour: 11000
	},
	{
		name: 'Gold ore',
		outputItems: new Bank().add('Gold ore'),
		gpCost: 225,
		quantityPerHour: 11000
	},
	{
		name: 'Coal',
		outputItems: new Bank().add('Coal'),
		gpCost: 67,
		quantityPerHour: 11000
	},
	{
		name: 'Blood rune',
		outputItems: new Bank().add('Blood rune'),
		gpCost: 400,
		quantityPerHour: 150_000,
		shopQuantity: 250,
		changePer: 0.1
	},
	{
		name: 'Law rune',
		outputItems: new Bank().add('Law rune'),
		gpCost: 240,
		quantityPerHour: 150_000,
		shopQuantity: 250,
		changePer: 0.1
	},
	{
		name: 'Soul rune',
		outputItems: new Bank().add('Soul rune'),
		gpCost: 300,
		quantityPerHour: 150_000,
		shopQuantity: 250,
		changePer: 0.1
	},
	{
		name: 'Astral rune',
		outputItems: new Bank().add('Astral rune'),
		gpCost: 50,
		quantityPerHour: 150_000,
		shopQuantity: 250,
		changePer: 0.1
	},
	{
		name: 'Death rune',
		outputItems: new Bank().add('Death rune'),
		gpCost: 180,
		quantityPerHour: 150_000,
		shopQuantity: 250,
		changePer: 0.1
	},
	{
		name: 'Nature rune',
		outputItems: new Bank().add('Nature rune'),
		gpCost: 180,
		quantityPerHour: 150_000,
		shopQuantity: 250,
		changePer: 0.1
	},
	{
		name: 'Chaos rune',
		outputItems: new Bank().add('Chaos rune'),
		gpCost: 90,
		quantityPerHour: 150_000,
		shopQuantity: 250,
		changePer: 0.1
	},
	{
		name: 'Chaos rune (pack)',
		outputItems: new Bank().add('Chaos rune', 100),
		gpCost: 9950,
		quantityPerHour: 15_000,
		shopQuantity: 35,
		changePer: 0.1
	}
];

export default tripBuyables;
