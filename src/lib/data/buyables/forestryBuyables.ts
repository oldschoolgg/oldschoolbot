import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const forestryBuyables: Buyable[] = [
	{
		name: 'Forestry kit',
		customReq: async user => {
			if (user.allItemsOwned.has('Forestry kit')) {
				return [false, 'You already own this item.'];
			}
			return [true];
		},
		maxQuantity: 1
	},
	{
		name: 'Secateurs blade',
		itemCost: new Bank().add('Anima-infused bark', 20).add('Oak logs', 10).add('Willow logs', 5)
	},
	{
		name: 'Ritual mulch',
		itemCost: new Bank().add('Anima-infused bark', 150).add('Maple logs', 10)
	},
	{
		name: 'Log brace',
		itemCost: new Bank().add('Anima-infused bark', 3000).add('Maple logs', 300).add('Yew logs', 300)
	},
	{
		name: 'Clothes pouch blueprint',
		itemCost: new Bank().add('Anima-infused bark', 10_000).add('Willow logs', 300).add('Maple logs', 300)
	},
	{
		name: 'Cape pouch',
		itemCost: new Bank().add('Anima-infused bark', 2500)
	},
	{
		name: 'Log basket',
		itemCost: new Bank().add('Anima-infused bark', 5000).add('Oak logs', 300).add('Willow logs', 300)
	},
	{
		name: 'Felling axe handle',
		itemCost: new Bank().add('Anima-infused bark', 10_000).add('Oak logs', 500)
	},
	{
		name: "Twitcher's gloves",
		itemCost: new Bank().add('Anima-infused bark', 5000).add('Willow logs', 500)
	},
	{
		name: 'Funky shaped log',
		itemCost: new Bank()
			.add('Anima-infused bark', 15_000)
			.add('Oak logs', 500)
			.add('Willow logs', 500)
			.add('Teak logs', 500)
			.add('Maple logs', 500)
			.add('Mahogany logs', 500)
			.add('Arctic pine logs', 500)
			.add('Yew logs', 500)
			.add('Magic logs', 500)
			.add('Redwood logs', 500)
	},
	{
		name: 'Sawmill voucher',
		itemCost: new Bank().add('Anima-infused bark', 150),
		outputItems: new Bank({ 'Sawmill voucher': 10 })
	},
	{
		name: 'Lumberjack boots',
		itemCost: new Bank().add('Anima-infused bark', 1000).add('Maple logs', 100).add('Yew logs', 200)
	},
	{
		name: 'Lumberjack hat',
		itemCost: new Bank().add('Anima-infused bark', 1200).add('Yew logs', 200).add('Magic logs', 100)
	},
	{
		name: 'Lumberjack legs',
		itemCost: new Bank().add('Anima-infused bark', 1300).add('Yew logs', 160).add('Magic logs', 140)
	},
	{
		name: 'Lumberjack top',
		itemCost: new Bank()
			.add('Anima-infused bark', 1500)
			.add('Yew logs', 60)
			.add('Magic logs', 120)
			.add('Redwood logs', 120)
	},
	{
		name: 'Forestry boots',
		itemCost: new Bank()
			.add('Anima-infused bark', 1250)
			.add('Lumberjack boots')
			.add('Oak logs', 60)
			.add('Willow logs', 60)
			.add('Teak logs', 60)
			.add('Maple logs', 60)
			.add('Mahogany logs', 60)
			.add('Arctic pine logs', 60)
			.add('Yew logs', 60)
			.add('Redwood logs', 60)
			.add('Magic logs', 60)
	},
	{
		name: 'Forestry hat',
		itemCost: new Bank()
			.add('Anima-infused bark', 1250)
			.add('Lumberjack hat')
			.add('Oak logs', 60)
			.add('Willow logs', 60)
			.add('Teak logs', 60)
			.add('Maple logs', 60)
			.add('Mahogany logs', 60)
			.add('Arctic pine logs', 60)
			.add('Yew logs', 60)
			.add('Redwood logs', 60)
			.add('Magic logs', 60)
	},
	{
		name: 'Forestry legs',
		itemCost: new Bank()
			.add('Anima-infused bark', 1250)
			.add('Lumberjack legs')
			.add('Oak logs', 60)
			.add('Willow logs', 60)
			.add('Teak logs', 60)
			.add('Maple logs', 60)
			.add('Mahogany logs', 60)
			.add('Arctic pine logs', 60)
			.add('Yew logs', 60)
			.add('Redwood logs', 60)
			.add('Magic logs', 60)
	},
	{
		name: 'Forestry top',
		itemCost: new Bank()
			.add('Anima-infused bark', 1250)
			.add('Lumberjack top')
			.add('Oak logs', 60)
			.add('Willow logs', 60)
			.add('Teak logs', 60)
			.add('Maple logs', 60)
			.add('Mahogany logs', 60)
			.add('Arctic pine logs', 60)
			.add('Yew logs', 60)
			.add('Redwood logs', 60)
			.add('Magic logs', 60)
	}
];
