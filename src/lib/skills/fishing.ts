import { SkillsEnum, Fish } from '../types';
import { Emoji } from '../constants';
import itemID from '../util/itemID';

const fishies: Fish[] = [
	{
		level: 1,
		xp: 10,
		id: itemID('Raw shrimps'),
		name: 'Raw shrimps',
		petChance: 435_165,
		timePerFish: 3.6,
		itemRequirement: itemID('Small fishing net')
	},
	{
		level: 5,
		xp: 20,
		id: itemID('Raw sardine'),
		name: 'Raw sardine',
		petChance: 528_000,
		bait: itemID('Fishing bait'),
		timePerFish: 3.6,
		itemRequirement: itemID('Fishing rod')
	},
	{
		level: 5,
		xp: 20,
		id: itemID('Raw karambwanji'),
		name: 'Raw karambwanji',
		petChance: 443_697,
		qpRequired: 15,
		timePerFish: 3.6,
		itemRequirement: itemID('Small fishing net')
	},
	{
		level: 10,
		xp: 30,
		id: itemID('Raw herring'),
		name: 'Raw herring',
		petChance: 528_000,
		bait: itemID('Fishing bait'),
		timePerFish: 3.6,
		itemRequirement: itemID('Fishing rod')
	},
	{
		level: 15,
		xp: 40,
		id: itemID('Raw anchovies'),
		name: 'Raw anchovies',
		petChance: 435_165,
		timePerFish: 7,
		itemRequirement: itemID('Small fishing net')
	},
	{
		level: 16,
		xp: 20,
		id: itemID('Raw mackerel'),
		name: 'Raw mackerel',
		petChance: 382_609,
		timePerFish: 3.6,
		itemRequirement: itemID('Big fishing net')
	},
	{
		level: 20,
		xp: 50,
		id: itemID('Raw trout'),
		name: 'Raw trout',
		petChance: 461_808,
		bait: itemID('Feather'),
		timePerFish: 4.5,
		itemRequirement: itemID('Fly fishing rod')
	},
	{
		level: 23,
		xp: 45,
		id: itemID('Raw cod'),
		name: 'Raw cod',
		petChance: 382_609,
		timePerFish: 5,
		itemRequirement: itemID('Big fishing net')
	},
	{
		level: 25,
		xp: 60,
		id: itemID('Raw pike'),
		name: 'Raw pike',
		petChance: 305_792,
		bait: itemID('Fishing bait'),
		timePerFish: 6,
		itemRequirement: itemID('Fishing rod')
	},
	{
		level: 30,
		xp: 70,
		id: itemID('Raw salmon'),
		name: 'Raw salmon',
		petChance: 461_808,
		bait: itemID('Feather'),
		timePerFish: 5.04,
		itemRequirement: itemID('Fly fishing rod')
	},
	{
		level: 35,
		xp: 80,
		id: itemID('Raw tuna'),
		name: 'Raw tuna',
		petChance: 128_885,
		timePerFish: 9.6,
		itemRequirement: itemID('Harpoon')
	},
	{
		level: 40,
		xp: 90,
		id: itemID('Raw lobster'),
		name: 'Raw lobster',
		petChance: 116_129,
		timePerFish: 11,
		itemRequirement: itemID('Lobster pot')
	},
	{
		level: 46,
		xp: 100,
		id: itemID('Raw bass'),
		name: 'Raw bass',
		petChance: 382_609,
		timePerFish: 10.3,
		itemRequirement: itemID('Big fishing net')
	},
	{
		level: 50,
		xp: 100,
		id: itemID('Raw swordfish'),
		name: 'Raw swordfish',
		petChance: 128_885,
		timePerFish: 11,
		itemRequirement: itemID('Harpoon')
	},
	{
		level: 62,
		xp: 120,
		id: itemID('Raw monkfish'),
		name: 'Raw monkfish',
		petChance: 138_583,
		qpRequired: 100,
		timePerFish: 13.5,
		itemRequirement: itemID('Small fishing net')
	},
	{
		level: 65,
		xp: 50,
		id: itemID('Raw karambwan'),
		name: 'Raw karambwan',
		petChance: 170_874,
		bait: itemID('Raw karambwanji'),
		timePerFish: 4.5,
		itemRequirement: itemID('Karambwan vessel')
	},
	{
		level: 76,
		xp: 110,
		id: itemID('Raw shark'),
		name: 'Raw shark',
		petChance: 82_243,
		timePerFish: 30,
		itemRequirement: itemID('Harpoon')
	},
	{
		level: 82,
		xp: 120,
		id: itemID('Raw anglerfish'),
		name: 'Raw anglerfish',
		petChance: 78_649,
		bait: itemID('Sandworms'),
		qpRequired: 40,
		timePerFish: 18.75,
		itemRequirement: itemID('Fishing rod')
	},
	{
		level: 85,
		xp: 130,
		id: itemID('Raw dark crab'),
		name: 'Raw dark crab',
		petChance: 149_434,
		bait: itemID('Dark fishing bait'),
		timePerFish: 11.7,
		itemRequirement: itemID('Lobster pot')
	}
];

const anglerItems: { [key: number]: number } = {
	[itemID('Angler hat')]: 0.4,
	[itemID('Angler top')]: 0.8,
	[itemID('Angler waders ')]: 0.6,
	[itemID('Angler boots')]: 0.2
};

const Fishing = {
	Fishies: fishies,
	id: SkillsEnum.Fishing,
	emoji: Emoji.Fishing,
	anglerItems
};

export default Fishing;
