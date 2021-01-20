import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { ItemBank } from '../types';
import resolveItems from '../util/resolveItems';

interface RandomEvent {
	id: number;
	name: string;
	outfit?: number[];
	loot: number[] | LootTable | ((userBank: Bank) => ItemBank);
}

export const beekeeperOutfit = resolveItems([
	"Beekeeper's hat",
	"Beekeeper's top",
	"Beekeeper's legs",
	"Beekeeper's gloves",
	"Beekeeper's boots"
]);

export const camoOutfit = resolveItems(['Camo helmet', 'Camo top', 'Camo bottoms']);

export const lederhosenOutfit = resolveItems([
	'Lederhosen hat',
	'Lederhosen top',
	'Lederhosen shorts'
]);

export const zombieOutfit = resolveItems([
	'Zombie mask',
	'Zombie shirt',
	'Zombie trousers',
	'Zombie gloves',
	'Zombie boots'
]);

export const mimeOutfit = resolveItems([
	'Mime mask',
	'Mime top',
	'Mime legs',
	'Mime gloves',
	'Mime boots'
]);

export const RandomEvents: RandomEvent[] = [
	{
		id: 1,
		name: 'Bee keeper',
		outfit: beekeeperOutfit,
		loot: new LootTable().add('Coins', [20, 60]).add('Flax', [1, 27])
	},
	{
		id: 2,
		name: 'Drill Demon',
		outfit: camoOutfit,
		loot: new LootTable().every('Coins', 500)
	},
	{
		id: 3,
		name: 'Drunken Dwarf',
		loot: new LootTable().every('Beer').every('Kebab')
	},
	{
		id: 4,
		name: 'Freaky Forester',
		loot: new LootTable().every('Coins', 500),
		outfit: lederhosenOutfit
	},
	{
		id: 5,
		name: 'Genie',
		loot: new LootTable().every('Genie lamp')
	},
	{
		id: 6,
		name: 'Gravedigger',
		loot: new LootTable().every('Coins', 500),
		outfit: zombieOutfit
	},
	{
		id: 7,
		name: 'Kiss the frog',
		loot: new LootTable().every('Frog token')
	},
	{
		id: 8,
		name: 'Mime',
		loot: new LootTable().every('Coins', 500),
		outfit: mimeOutfit
	},
	{
		id: 9,
		name: 'Quiz master',
		loot: new LootTable().every('Mystery box')
	},
	{
		id: 10,
		name: 'Sandwich lady',
		loot: new LootTable()
			.add('Baguette')
			.add('Triangle sandwich')
			.add('Square sandwich')
			.add('Chocolate bar')
			.add('Kebab')
			.add('Roll')
			.add('Meat pie')
	},
	{
		id: 11,
		name: 'Surprise Exam',
		loot: new LootTable().every('Book of knowledge')
	},
	{
		id: 12,
		name: "Capt' Arnav's Chest",
		loot: new LootTable()
			.add('Gold ring')
			.add('Gold necklace')
			.add('Gold bar')
			.add('Gold ore')
			.add('Coins', [20, 100])
	},
	{
		id: 13,
		name: 'Certers',
		// ['Niles', 'Miles', 'Giles']
		loot: new LootTable()
			.add('Coins', [20, 100])
			.add('Uncut ruby')
			.add('Emerald')
			.add('Cosmic talisman')
			.add('Nature talisman')
			.add('Spinach roll')
			.add('Tooth half of a key')
			.add('Loop half of a key')
	}
];
