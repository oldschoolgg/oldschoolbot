import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import type { Fish } from '../types';
import { SkillsEnum } from '../types';

const fishes: Fish[] = [
	{
		level: 1,
		xp: 10,
		id: itemID('Raw shrimps'),
		name: 'Shrimps',
		petChance: 435_165,
		timePerFish: 3.6,
		clueScrollChance: 870_330
	},
	{
		level: 5,
		xp: 20,
		id: itemID('Raw sardine'),
		name: 'Sardine',
		petChance: 528_000,
		bait: itemID('Fishing bait'),
		timePerFish: 3.6,
		clueScrollChance: 1_056_000
	},
	{
		level: 5,
		xp: 20,
		id: itemID('Raw karambwanji'),
		name: 'Karambwanji',
		petChance: 443_697,
		qpRequired: 15,
		timePerFish: 3.6,
		clueScrollChance: 443_697
	},
	{
		level: 10,
		xp: 30,
		id: itemID('Raw herring'),
		name: 'Herring',
		petChance: 528_000,
		bait: itemID('Fishing bait'),
		timePerFish: 3.6,
		clueScrollChance: 1_056_000
	},
	{
		level: 15,
		xp: 40,
		id: itemID('Raw anchovies'),
		name: 'Anchovies',
		petChance: 435_165,
		timePerFish: 7,
		clueScrollChance: 870_330
	},
	{
		level: 16,
		xp: 20,
		id: itemID('Raw mackerel'),
		name: 'Mackerel',
		petChance: 382_609,
		timePerFish: 3.6,
		clueScrollChance: 1_147_827
	},
	{
		level: 20,
		xp: 50,
		id: itemID('Raw trout'),
		name: 'Trout',
		petChance: 461_808,
		bait: itemID('Feather'),
		timePerFish: 4.5,
		clueScrollChance: 923_616
	},
	{
		level: 23,
		xp: 45,
		id: itemID('Raw cod'),
		name: 'Cod',
		petChance: 382_609,
		timePerFish: 5,
		clueScrollChance: 1_147_827
	},
	{
		level: 25,
		xp: 60,
		id: itemID('Raw pike'),
		name: 'Pike',
		petChance: 305_792,
		bait: itemID('Fishing bait'),
		timePerFish: 6,
		clueScrollChance: 305_792
	},
	{
		level: 30,
		xp: 70,
		id: itemID('Raw salmon'),
		name: 'Salmon',
		petChance: 461_808,
		bait: itemID('Feather'),
		timePerFish: 5.04,
		clueScrollChance: 923_616
	},
	{
		level: 35,
		xp: 80,
		id: itemID('Raw tuna'),
		name: 'Tuna',
		petChance: 128_885,
		timePerFish: 9.6,
		clueScrollChance: 257_770
	},
	{
		level: 38,
		xp: 80,
		id: itemID('Raw cave eel'),
		name: 'Cave eel',
		timePerFish: 12.6
	},
	{
		level: 40,
		xp: 90,
		id: itemID('Raw lobster'),
		name: 'Lobster',
		petChance: 116_129,
		timePerFish: 11,
		clueScrollChance: 116_129
	},
	{
		level: 46,
		xp: 100,
		id: itemID('Raw bass'),
		name: 'Bass',
		petChance: 382_609,
		timePerFish: 10.3,
		bigFish: itemID('Big bass'),
		bigFishRate: 1000,
		clueScrollChance: 1_147_827
	},
	{
		level: 50,
		xp: 100,
		id: itemID('Raw swordfish'),
		name: 'Swordfish',
		alias: ['sword'],
		petChance: 128_885,
		timePerFish: 11,
		bigFish: itemID('Big swordfish'),
		bigFishRate: 2500,
		clueScrollChance: 257_770
	},
	{
		level: 62,
		xp: 120,
		id: itemID('Raw monkfish'),
		name: 'Monkfish',
		alias: ['monk'],
		petChance: 138_583,
		qpRequired: 100,
		timePerFish: 13.5,
		clueScrollChance: 138_583
	},
	{
		level: 65,
		xp: 50,
		id: itemID('Raw karambwan'),
		name: 'Karambwan',
		petChance: 170_874,
		bait: itemID('Raw karambwanji'),
		timePerFish: 4.5,
		clueScrollChance: 170_874
	},
	{
		level: 76,
		xp: 110,
		id: itemID('Raw shark'),
		name: 'Shark',
		petChance: 82_243,
		timePerFish: 30,
		bigFish: itemID('Big shark'),
		bigFishRate: 5000,
		clueScrollChance: 82_243
	},
	{
		level: 82,
		xp: 120,
		id: itemID('Raw anglerfish'),
		name: 'Anglerfish',
		alias: ['angler'],
		petChance: 78_649,
		bait: itemID('Sandworms'),
		qpRequired: 40,
		timePerFish: 18.75,
		clueScrollChance: 78_649
	},
	{
		level: 82,
		xp: 26.1,
		id: itemID('Minnow'),
		name: 'Minnow',
		alias: ['minnows'],
		petChance: 977_778,
		qpRequired: 1,
		timePerFish: 2.14,
		clueScrollChance: 977_778
	},
	{
		level: 85,
		xp: 130,
		id: itemID('Raw dark crab'),
		name: 'Dark crab',
		alias: ['crab', 'dark'],
		petChance: 149_434,
		bait: itemID('Dark fishing bait'),
		timePerFish: 11.7,
		clueScrollChance: 149_434
	},
	{
		level: 48,
		xp: 130,
		id: itemID('Leaping trout'),
		name: 'Barbarian fishing',
		alias: ['barb', 'barbarian'],
		petChance: 426_954,
		bait: itemID('Feather'),
		timePerFish: 3,
		clueScrollChance: 1_280_862
	},
	{
		level: 80,
		xp: 95,
		id: itemID('Infernal eel'),
		name: 'Infernal eel',
		petChance: 160_000,
		bait: itemID('Fishing bait'),
		timePerFish: 12.4,
		clueScrollChance: 165_000
	}
];

// Types of fish in camdozaal
const camdozaalFishes: Fish[] = [
	{
		level: 7,
		xp: 8,
		id: itemID('Raw guppy'),
		name: 'Raw guppy',
		petChance: 257_770,
		timePerFish: 5.5,
		clueScrollChance: 257_770
	},
	{
		level: 20,
		xp: 16,
		id: itemID('Raw cavefish'),
		name: 'Raw cavefish',
		petChance: 257_770,
		timePerFish: 5.5,
		clueScrollChance: 257_770
	},
	{
		level: 33,
		xp: 24,
		id: itemID('Raw tetra'),
		name: 'Raw tetra',
		petChance: 257_770,
		timePerFish: 5.5,
		clueScrollChance: 257_770
	},
	{
		level: 46,
		xp: 33,
		id: itemID('Raw catfish'),
		name: 'Raw catfish',
		petChance: 257_770,
		timePerFish: 5.5,
		clueScrollChance: 257_770
	}
];

const anglerItems: { [key: number]: number } = {
	[itemID('Angler hat')]: 0.4,
	[itemID('Angler top')]: 0.8,
	[itemID('Angler waders ')]: 0.6,
	[itemID('Angler boots')]: 0.2
};

const Fishing = {
	aliases: ['fishing'],
	Fishes: fishes,
	camdozaalFishes,
	id: SkillsEnum.Fishing,
	emoji: Emoji.Fishing,
	anglerItems,
	name: 'Fishing'
};

export default Fishing;
