import { Bank } from 'oldschooljs';

import { Buyable } from './buyables';

export const forestryBuyables: Buyable[] = [
	{
		name: 'Forestry kit',
		outputItems: () => new Bank().add('Forestry kit'),
		customReq: async user => {
			if (user.allItemsOwned.has('Forestry kit')) {
				return [false, 'You already own this item.'];
			}
			return [true];
		}
	},
	{
		name: 'Secateurs blade',
		itemCost: new Bank().add('Anima-infused bark', 20).add('Oak logs', 10).add('Willow logs', 5).add('Iron bar'),
		skillsNeeded: {
			woodcutting: 35,
			smithing: 35
		}
	},
	{
		name: 'Ritual mulch',
		itemCost: new Bank().add('Anima-infused bark', 150).add('Maple logs', 10).add('Dwarf weed'),
		skillsNeeded: {
			woodcutting: 68,
			farming: 50
		}
	},
	{
		name: 'Clover insignia',
		itemCost: new Bank().add('Anima-infused bark', 200).add('Oak logs', 15).add('Emerald').add('Ball of wool'),
		skillsNeeded: {
			woodcutting: 70,
			farming: 35,
			crafting: 70
		}
	},
	{
		name: 'Powdered pollen',
		itemCost: new Bank().add('Anima-infused bark', 300).add('Willow logs', 15).add('Logs').add('Ball of wool'),
		skillsNeeded: {
			woodcutting: 35,
			hunter: 50
		}
	},
	{
		name: 'Log brace',
		itemCost: new Bank()
			.add('Anima-infused bark', 3000)
			.add('Maple logs', 300)
			.add('Yew logs', 300)
			.add('Steel nails', 45)
			.add('Rope', 2)
			.add('Adamantite bar', 3),
		skillsNeeded: {
			smithing: 75,
			woodcutting: 75
		}
	},
	{
		name: 'Clothes pouch blueprint',
		itemCost: new Bank()
			.add('Anima-infused bark', 10_000)
			.add('Willow logs', 300)
			.add('Maple logs', 300)
			.add('Thread')
			.add('Leather'),
		skillsNeeded: {
			crafting: 50,
			woodcutting: 50
		}
	},
	{
		name: 'Log basket',
		itemCost: new Bank().add('Anima-infused bark', 5000).add('Willow logs', 300).add('Maple logs', 300)
	},
	{
		name: 'Funky shaped log',
		itemCost: new Bank()
			.add('Anima-infused bark', 15_000)
			.add('Oak logs', 500)
			.add('Maple logs', 500)
			.add('Willow logs', 500)
			.add('Mahogany logs', 500)
			.add('Arctic pine logs', 500)
			.add('Yew logs', 500)
			.add('Redwood logs', 500)
			.add('Magic logs', 500)
	},
	{
		name: 'Lumberjack boots',
		itemCost: new Bank().add('Anima-infused bark', 1000).add('Yew logs', 200).add('Maple logs', 100)
	},
	{
		name: 'Lumberjack hat',
		itemCost: new Bank().add('Anima-infused bark', 1200).add('Yew logs', 200).add('Magic logs', 100)
	},
	{
		name: 'Lumberjack legs',
		itemCost: new Bank().add('Anima-infused bark', 1300).add('Yew logs', 160).add('Maple logs', 140)
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
			.add('Maple logs', 60)
			.add('Willow logs', 60)
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
			.add('Maple logs', 60)
			.add('Willow logs', 60)
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
			.add('Maple logs', 60)
			.add('Willow logs', 60)
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
			.add('Maple logs', 60)
			.add('Willow logs', 60)
			.add('Mahogany logs', 60)
			.add('Arctic pine logs', 60)
			.add('Yew logs', 60)
			.add('Redwood logs', 60)
			.add('Magic logs', 60)
	}
];
