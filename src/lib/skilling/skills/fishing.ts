import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import type { Fish } from '../types';
import { SkillsEnum } from '../types';

const fishes: Fish[] = [
	{
		name: 'Shrimps/Anchovies',
		level: 1,
		xp: 10,
		id: itemID('Raw shrimps'),
		intercept1: 0.1373, // catch chance for fish 1 at lvl 1
		slope1: 0.0083,

		level2: 15,
		xp2: 40,
		id2: itemID('Raw anchovies'),
		intercept2: 0.0937,
		slope2: 0.0042,

		petChance: 435_165,
		clueScrollChance: 870_330,
		lostTicks: 0.05, // percentage of ticks spent moving/dropping,
		bankingTime: 30,
		ticksPerRoll: 6
	},
	{
		name: 'Sardine/Herring',
		level: 5,
		xp: 20,
		id: itemID('Raw sardine'),
		intercept1: 0.1267,
		slope1: 0.0064,

		level2: 10,
		xp2: 30,
		id2: itemID('Raw herring'),
		intercept2: 0.1273,
		slope2: 0.0038,

		bait: itemID('Fishing bait'),
		petChance: 528_000,
		clueScrollChance: 1_056_000,
		lostTicks: 0.05,
		bankingTime: 30,
		ticksPerRoll: 5
	},
	{
		name: 'Karambwanji',
		level: 5,
		xp: 20,
		id: itemID('Raw karambwanji'),
		intercept1: 0.3945,
		slope1: 0.0060,

		petChance: 443_697,
		qpRequired: 15,
		clueScrollChance: 443_697,
		lostTicks: 0.01,
		bankingTime: 0,
		ticksPerRoll: 6
	},
	{
		name: 'Mackerel/Cod/Bass',
		level: 16,
		xp: 20,
		id: itemID('Raw mackerel'),
		intercept1: 0.0645,
		slope1: 0.0023,

		level2: 23,
		xp2: 45,
		id2: itemID('Raw cod'),
		intercept2: 0.0173,
		slope2: 0.0021,

		level3: 46,
		xp3: 100,
		id3: itemID('Raw bass'),
		bigFish: itemID('Big bass'),
		bigFishRate: 1000,
		intercept3: 0.0156,
		slope3: 0.0015,

		petChance: 382_609,
		clueScrollChance: 1_147_827,
		lostTicks: 0.05,
		bankingTime: 25,
		ticksPerRoll: 6
	},
	{
		name: 'Trout/Salmon',
		level: 20,
		xp: 50,
		id: itemID('Raw trout'),
		intercept1: 0.0174,
		slope1: 0.0075,

		level2: 30,
		xp2: 70,
		id2: itemID('Raw salmon'),
		intercept2: 0.0683,
		slope2: 0.0032,

		petChance: 461_808,
		bait: itemID('Feather'),
		clueScrollChance: 923_616,
		lostTicks: 0.05,
		bankingTime: 30,
		ticksPerRoll: 5
	},
	{
		name: 'Pike',
		level: 25,
		xp: 60,
		id: itemID('Raw pike'),
		intercept1: 0.0685,
		slope1: 0.0032,

		petChance: 305_792,
		bait: itemID('Fishing bait'),
		clueScrollChance: 305_792,
		lostTicks: 0.05,
		bankingTime: 30,
		ticksPerRoll: 5
	},
	{
		name: 'Tuna/Swordfish',
		alias: ['sword, sf'],
		level: 35,
		xp: 80,
		id: itemID('Raw tuna'),
		intercept1: 0.0326,
		slope1: 0.0023,

		level2: 50,
		xp2: 100,
		id2: itemID('Raw swordfish'),
		bigFish: itemID('Big swordfish'),
		bigFishRate: 2500,
		intercept2: 0.0196,
		slope2: 0.0018,

		petChance: 128_885,
		clueScrollChance: 257_770,
		lostTicks: 0.05,
		bankingTime: 25,
		ticksPerRoll: 6
	},
	{
		name: 'Cave eel',
		level: 38,
		xp: 80,
		id: itemID('Raw cave eel'),
		intercept1: 0.1900,
		slope1: 0.0013,
		lostTicks: 0.05,
		bankingTime: 40,
		ticksPerRoll: 5
	},
	{
		name: 'Lobster',
		alias: ['lobs'],
		level: 40,
		xp: 90,
		id: itemID('Raw lobster'),
		intercept1: 0.0247,
		slope1: 0.0036,
		petChance: 116_129,
		clueScrollChance: 116_129,
		lostTicks: 0.05,
		bankingTime: 25,
		ticksPerRoll: 6
	},
	{
		name: 'Monkfish',
		alias: ['monk'],
		level: 62,
		xp: 120,
		id: itemID('Raw monkfish'),
		intercept1: 0.1900,
		slope1: 0.0017,
		petChance: 138_583,
		qpRequired: 100,
		clueScrollChance: 138_583,
		lostTicks: 0.10,
		bankingTime: 20,
		ticksPerRoll: 6
	},
	{
		name: 'Karambwan',
		alias: ['karam'],
		level: 65,
		xp: 50,
		id: itemID('Raw karambwan'),
		intercept1: 0.0210,
		slope1: 0.0062,
		petChance: 170_874,
		bait: itemID('Raw karambwanji'),
		clueScrollChance: 170_874,
		lostTicks: 0.00, // fishing spots never moves
		bankingTime: 25,
		ticksPerRoll: 4
	},
	{
		name: 'Shark',
		alias: ['shark'],
		level: 76,
		xp: 110,
		id: itemID('Raw shark'),
		intercept1: 0.0102,
		slope1: 0.0015,
		petChance: 82_243,
		bigFish: itemID('Big shark'),
		bigFishRate: 5000,
		clueScrollChance: 82_243,
		lostTicks: 0.05,
		bankingTime: 25,
		ticksPerRoll: 6
	},
	{
		name: 'Anglerfish',
		alias: ['angler'],
		level: 82,
		xp: 120,
		id: itemID('Raw anglerfish'),
		intercept1: 0.0096,
		slope1: 0.0014,
		petChance: 78_649,
		bait: itemID('Sandworms'),
		qpRequired: 40,
		clueScrollChance: 78_649,
		lostTicks: 0.05,
		bankingTime: 30,
		ticksPerRoll: 5
	},
	{
		name: 'Minnow',
		alias: ['minnows'],
		level: 82,
		xp: 26.1,
		id: itemID('Minnow'),
		intercept1: -0.5690, // no info on catch chance
		slope1: 0.0153, // handpicked to match wiki rates
		petChance: 977_778,
		qpRequired: 1,
		clueScrollChance: 977_778,
		lostTicks: 0.25,
		bankingTime: 0, // stackable
		ticksPerRoll: 2
	},
	{
		name: 'Dark crab',
		alias: ['crab', 'dark'],
		level: 85,
		xp: 130,
		id: itemID('Raw dark crab'),
		intercept1: 0.0230,
		slope1: 0.0014,
		petChance: 149_434,
		bait: itemID('Dark fishing bait'),
		clueScrollChance: 149_434,
		lostTicks: 0.05,
		bankingTime: 0,
		ticksPerRoll: 6
	},
	{
		name: 'Barbarian fishing',
		alias: ['barb', 'barbarian'],
		level: 48,
		xp: 50,
		id: itemID('Leaping trout'),
		intercept1: 32 / 255,
		slope1: (192 - 32) / 255 / 98,

		level2: 58,
		xp2: 70,
		id2: itemID('Leaping salmon'),
		intercept2: 16 / 255,
		slope2: (96 - 16) / 255 / 98,

		level3: 70,
		xp3: 80,
		id3: itemID('Leaping sturgeon'),
		intercept3: 8 / 255,
		slope3: (64 - 8) / 255 / 98,

		petChance: 426_954,
		bait: itemID('Feather'),
		clueScrollChance: 1_280_862,
		lostTicks: 0.05,
		bankingTime: 40,
		ticksPerRoll: 5
	},
	{
		name: 'Infernal eel',
		level: 80,
		xp: 95,
		id: itemID('Infernal eel'),
		petChance: 160_000,
		bait: itemID('Fishing bait'),
		clueScrollChance: 165_000,
		intercept1: 0.1253,
		slope1: 0.3672,
		lostTicks: 0.10,
		bankingTime: 0,
		ticksPerRoll: 5
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
