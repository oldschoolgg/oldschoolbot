import { holidayOpenableItemIDs } from '@/lib/bso/discoBloodbath.js';
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

export const LazyMysteryBoxTable = new LootTable()
	.add('Two of Hearts')
	.add('Idle idol')
	.add('Trust fund tiara')
	.add('Count Napula');

export const DiscoNormalLoot = new LootTable()
	.add('Smorkey painting')
	.add('10% Pumpkinhead pie')
	.add('Roosted newt')
	.tertiary(50, 'Slothario')
	.tertiary(100, new LootTable().add('Skrink box').add('Skrod Box'));

export const SkrinkBoxTable = new LootTable()
	.add('Disco bloodbath')
	.add('Skrinkle')
	.add('Skrink mink')
	.add('Resting rich face')
	.add('Lazily rollers')
	// Note: Partyhat should be rare / chase, so depending on box rarity, this number might change a lot
	.tertiary(10, 'Premierekat')
	.tertiary(50, 'Partytimehat');

export const SkrodBoxTable = new LootTable()
	.add('Disco bloodbath')
	.add('Disco infernowl')
	.add('Afterparty afterlife')
	.add('Glam jam platformers')
	.add('Couch potato sceptre')
	// Note: Partyhat should be rare / chase, so depending on box rarity, this number might change a lot
	.tertiary(10, 'Premierekat')
	.tertiary(50, 'Partytimehat');

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
			smokeyApplies: name !== 'Lazy Mystery Box'
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

for (const { allItems } of holidayOpenables) {
	for (const itemID of allItems) holidayOpenableItemIDs.add(itemID);
}
