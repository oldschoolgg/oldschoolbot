import {
	BeachMysteryBoxTable,
	IndependenceBoxTable,
	RoyalMysteryBoxTable,
	spookyTable
} from '@/lib/bso/openables/tables.js';

import { Items, itemID, LootTable } from 'oldschooljs';

import type { UnifiedOpenable } from '@/lib/openables.js';

const christmasPetFoodTable = new LootTable()
	.add('Pumpkinhead praline')
	.add('Takon truffle')
	.add('Seer sweet')
	.add('Cob cup')
	.add('Craig creme')
	.add('Moktang mint')
	.add('Festive treats')
	.add('Pork sausage')
	.add('Pork crackling')
	.add('Reinbeer');

const christmasLootTable = new LootTable()
	.tertiary(18, 'Christmas box')
	.add(
		new LootTable()
			.add('Festive jumper (2022)', 1, 2)
			.add('Christmas cape', 1, 2)
			.add('Christmas socks', 1, 2)
			.add('Tinsel scarf', 1, 4)
			.add('Frosted wreath', 1, 4)
			.add('Edible yoyo', 1, 4)
			.add(christmasPetFoodTable, 1, 5)
	)
	.add(christmasPetFoodTable, 1, 4)
	.add(
		new LootTable()
			.add('Pavlova')
			.add('Prawns')
			.add('Roast potatoes')
			.add('Cake')
			.add('Chocolate cake')
			.add('Chocolate bar')
			.add('Bucket of milk')
			.add('Chocchip crunchies'),
		1,
		4
	);

const ChristmasBoxTable = new LootTable()
	.add('Candy partyhat')
	.add(christmasLootTable, 1, 4)
	.add('Christmas dye', 1, 3)
	.add('Coal', 1, 2);

export const holidayOpenables: UnifiedOpenable[] = [
	{
		name: 'Royal mystery box',
		id: itemID('Royal mystery box'),
		openedItem: Items.getOrThrow('Royal mystery box'),
		aliases: ['royal mystery box'],
		output: RoyalMysteryBoxTable,
		allItems: RoyalMysteryBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Beach mystery box',
		id: itemID('Beach mystery box'),
		openedItem: Items.getOrThrow('Beach mystery box'),
		aliases: ['Beach mystery box'],
		output: BeachMysteryBoxTable,
		allItems: BeachMysteryBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Independence box',
		id: itemID('Independence box'),
		openedItem: Items.getOrThrow('Independence box'),
		aliases: ['independence box'],
		output: IndependenceBoxTable,
		allItems: IndependenceBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Spooky box',
		id: itemID('Spooky box'),
		openedItem: Items.getOrThrow('Spooky box'),
		aliases: ['spooky box'],
		output: spookyTable,
		allItems: spookyTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Christmas box',
		id: itemID('Christmas box'),
		openedItem: Items.getOrThrow('Christmas box'),
		aliases: ['christmas box'],
		output: ChristmasBoxTable,
		allItems: ChristmasBoxTable.allItems,
		excludeFromOpenAll: true
	},
	{
		name: 'Halloween cracker',
		id: itemID('Halloween cracker'),
		openedItem: Items.getOrThrow('Halloween cracker'),
		aliases: ['halloween cracker'],
		output: new LootTable()
			.add('Zombie halloween mask')
			.add('Bloody halloween mask')
			.add('Monster in a backpack')
			.add('Pumpkin parasol')
			.add('Vampyric halloween mask')
			.add('Zombie cow plushie')
			.add('Deathtouched tart'),
		allItems: [],
		smokeyApplies: false
	}
];
