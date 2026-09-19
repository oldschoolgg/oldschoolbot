import {
	BeachMysteryBoxTable,
	IndependenceBoxTable,
	IndependenceDay2BoxTable,
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

const HalloweenCrackerTable = new LootTable()
	.add('Zombie halloween mask')
	.add('Bloody halloween mask')
	.add('Monster in a backpack')
	.add('Pumpkin parasol')
	.add('Vampyric halloween mask')
	.add('Zombie cow plushie')
	.add('Deathtouched tart');

// Provisional promo tables: one reward per box, every non-box promo item at weight 1.
// Keep separate table instances so each box can receive its own final loot design.
const lazyPromoRewards = [
	'Lazily rollers',
	'Procrasti-crown',
	'Snooze control',
	'Resting rich face',
	'Loaf lord loafers',
	'Duvet dictator',
	'Couch potato sceptre',
	'Idle idol',
	'Trust fund tiara',
	'Gross domestic bling',
	'Cheque mate',
	'Executive excess',
	'Velvet rope sceptre',
	'Fame fatal',
	'Glam jam platformers',
	'Age of the thing',
	'Disco bloodbath',
	'Two hot to heart',
	'Skrink mink',
	'Afterparty afterlife',
	'Fire dragon skull',
	'Fire dragon poncho',
	'Fire dragon greaves',
	'Fire dragon boots',
	'Chunky Hunky Mask',
	'Chunky Hunky Boots',
	'Chunky Hunky Mittens',
	'Chunky Hunky bodysuit',
	'Chunky Hunk leggings',
	'Skrinkle',
	'Count Napula',
	'Premierekat',
	'Disco infernowl',
	'Slothario'
] as const;

function makeLazyPromoTable() {
	const table = new LootTable();
	for (const item of lazyPromoRewards) table.add(item, 1, 1);
	return table;
}

export const LazyMysteryBoxTable = makeLazyPromoTable();
export const SkrinkBoxTable = makeLazyPromoTable();
export const SkrodBoxTable = makeLazyPromoTable();

export const holidayOpenables: UnifiedOpenable[] = [
	...(
		[
			['Lazy Mystery Box', LazyMysteryBoxTable],
			['Skrink box', SkrinkBoxTable],
			['Skrod box', SkrodBoxTable]
		] as const
	).map(
		([name, table]): UnifiedOpenable => ({
			name,
			id: itemID(name),
			openedItem: Items.getOrThrow(name),
			aliases: [name.toLowerCase()],
			output: table,
			allItems: table.allItems,
			excludeFromOpenAll: true,
			smokeyApplies: false
		})
	),
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
		name: 'Independence Day 2 Box',
		id: itemID('Independence Day 2 Box'),
		openedItem: Items.getOrThrow('Independence Day 2 Box'),
		aliases: ['independence day 2 box', 'id2 box'],
		output: IndependenceDay2BoxTable,
		allItems: IndependenceDay2BoxTable.allItems,
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
		output: HalloweenCrackerTable,
		allItems: HalloweenCrackerTable.allItems,
		smokeyApplies: false
	}
];
