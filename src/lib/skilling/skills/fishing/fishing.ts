import { Emoji } from '@oldschoolgg/toolkit';
import { itemID } from 'oldschooljs';

import { defineSkill, type Fish } from '@/lib/skilling/types.js';
import { calcFishingTripResult } from './fishingTrip.js';
import { calcFishingTripStart } from './fishingTripStart.js';
import {
	anglerItems,
	calcAnglerBonusXP,
	calcAnglerBoostPercent,
	calcMinnowQuantityRange,
	calcRadasBlessingBoost
} from './fishingUtil.js';

const fishes: Fish[] = [
	{
		name: 'Shrimps/Anchovies',
		subfishes: [
			{
				id: itemID('Raw shrimps'),
				level: 1,
				xp: 10,
				intercept: 0.1373,
				slope: 0.0083
			},
			{
				id: itemID('Raw anchovies'),
				level: 15,
				xp: 40,
				intercept: 0.0937,
				slope: 0.0042
			}
		],
		petChance: 435_165,
		clueScrollChance: 435_165,
		lostTicks: 0.1,
		bankingTime: 30,
		ticksPerRoll: 6
	},
	{
		name: 'Sardine/Herring',
		subfishes: [
			{
				id: itemID('Raw sardine'),
				level: 5,
				xp: 20,
				intercept: 0.1267,
				slope: 0.0064
			},
			{
				id: itemID('Raw herring'),
				level: 10,
				xp: 30,
				intercept: 0.1273,
				slope: 0.0038
			}
		],
		bait: itemID('Fishing bait'),
		petChance: 528_000,
		clueScrollChance: 528_000,
		lostTicks: 0.1,
		bankingTime: 30,
		ticksPerRoll: 5
	},
	{
		name: 'Karambwanji',
		subfishes: [
			{
				id: itemID('Raw karambwanji'),
				level: 5,
				xp: 5,
				intercept: 0.3945,
				slope: 0.006
			}
		],
		petChance: 443_697,
		qpRequired: 15,
		clueScrollChance: 443_697,
		lostTicks: 0.01,
		bankingTime: 0,
		ticksPerRoll: 6
	},
	{
		name: 'Mackerel/Cod/Bass',
		subfishes: [
			{
				id: itemID('Raw mackerel'),
				level: 16,
				xp: 20,
				intercept: 0.0645,
				slope: 0.0023
			},
			{
				id: itemID('Raw cod'),
				level: 23,
				xp: 45,
				intercept: 0.0173,
				slope: 0.0021
			},
			{
				id: itemID('Raw bass'),
				level: 46,
				xp: 100,
				intercept: 0.0156,
				slope: 0.0015,
				tertiary: { chance: 1000, id: itemID('Big bass') }
			}
		],
		petChance: 382_609,
		clueScrollChance: 382_609,
		lostTicks: 0.1,
		bankingTime: 25,
		ticksPerRoll: 6
	},
	{
		name: 'Trout/Salmon',
		subfishes: [
			{
				id: itemID('Raw trout'),
				level: 20,
				xp: 50,
				intercept: 0.0174,
				slope: 0.0075
			},
			{
				id: itemID('Raw salmon'),
				level: 30,
				xp: 70,
				intercept: 0.0683,
				slope: 0.0032
			}
		],
		bait: itemID('Feather'),
		petChance: 461_808,
		clueScrollChance: 461_808,
		lostTicks: 0.1,
		bankingTime: 30,
		ticksPerRoll: 5,
		moonKeyHalfCatchRate: { numerator: 1, denominator: 4100 }
	},
	{
		name: 'Pike',
		subfishes: [
			{
				id: itemID('Raw pike'),
				level: 25,
				xp: 60,
				intercept: 0.0685,
				slope: 0.0032
			}
		],
		bait: itemID('Fishing bait'),
		petChance: 305_792,
		clueScrollChance: 305_792,
		lostTicks: 0.1,
		bankingTime: 30,
		ticksPerRoll: 5
	},
	{
		name: 'Tuna/Swordfish',
		alias: ['sword', 'sf'],
		subfishes: [
			{
				id: itemID('Raw tuna'),
				level: 35,
				xp: 80,
				intercept: 0.0326,
				slope: 0.0023
			},
			{
				id: itemID('Raw swordfish'),
				level: 50,
				xp: 100,
				intercept: 0.0196,
				slope: 0.0018,
				tertiary: { chance: 2500, id: itemID('Big swordfish') }
			}
		],
		petChance: 257_770,
		clueScrollChance: 257_770,
		lostTicks: 0.1,
		bankingTime: 25,
		ticksPerRoll: 6,
		moonKeyHalfCatchRate: { numerator: 3, denominator: 5000 }
	},
	{
		name: 'Cave eel',
		subfishes: [
			{
				id: itemID('Raw cave eel'),
				level: 38,
				xp: 80,
				intercept: 0.19,
				slope: 0.0013
			}
		],
		petChance: 257_770,
		clueScrollChance: 257_770,
		lostTicks: 0.1,
		bankingTime: 40,
		ticksPerRoll: 5
	},
	{
		name: 'Lobster',
		alias: ['lobs'],
		subfishes: [
			{
				id: itemID('Raw lobster'),
				level: 40,
				xp: 90,
				intercept: 0.0247,
				slope: 0.0036
			}
		],
		petChance: 116_129,
		clueScrollChance: 116_129,
		lostTicks: 0.1,
		bankingTime: 25,
		ticksPerRoll: 6,
		moonKeyHalfCatchRate: { numerator: 3, denominator: 5000 }
	},
	{
		name: 'Monkfish',
		alias: ['monk'],
		subfishes: [
			{
				id: itemID('Raw monkfish'),
				level: 62,
				xp: 120,
				intercept: 0.19,
				slope: 0.0017
			}
		],
		petChance: 138_583,
		qpRequired: 100,
		clueScrollChance: 138_583,
		lostTicks: 0.13,
		bankingTime: 20,
		ticksPerRoll: 6
	},
	{
		name: 'Karambwan',
		alias: ['karam'],
		subfishes: [
			{
				id: itemID('Raw karambwan'),
				level: 65,
				xp: 50,
				intercept: 0.021,
				slope: 0.0062
			}
		],
		petChance: 170_874,
		bait: itemID('Raw karambwanji'),
		clueScrollChance: 170_874,
		lostTicks: 0.01,
		bankingTime: 25,
		ticksPerRoll: 4
	},
	{
		name: 'Shark',
		alias: ['shark'],
		subfishes: [
			{
				id: itemID('Raw shark'),
				level: 76,
				xp: 110,
				intercept: 0.0102,
				slope: 0.0015,
				tertiary: { chance: 5000, id: itemID('Big shark') }
			}
		],
		petChance: 82_243,
		clueScrollChance: 82_243,
		lostTicks: 0.1,
		bankingTime: 25,
		ticksPerRoll: 6,
		moonKeyHalfCatchRate: { numerator: 1, denominator: 580 }
	},
	{
		name: 'Infernal eel',
		subfishes: [
			{
				id: itemID('Infernal eel'),
				level: 80,
				xp: 95,
				intercept: 0.1253,
				slope: 0.0025
			}
		],
		petChance: 160_000,
		bait: itemID('Fishing bait'),
		clueScrollChance: 165_000,
		lostTicks: 0.13,
		bankingTime: 0,
		ticksPerRoll: 5
	},
	{
		name: 'Anglerfish',
		alias: ['angler'],
		subfishes: [
			{
				id: itemID('Raw anglerfish'),
				level: 82,
				xp: 120,
				intercept: 0.0096,
				slope: 0.0014
			}
		],
		petChance: 78_649,
		bait: itemID('Sandworms'),
		qpRequired: 40,
		clueScrollChance: 78_649,
		lostTicks: 0.1,
		bankingTime: 30,
		ticksPerRoll: 5
	},
	{
		name: 'Minnow',
		alias: ['minnows'],
		subfishes: [
			{
				id: itemID('Minnow'),
				level: 82,
				xp: 26.1,
				intercept: -0.569,
				slope: 0.0153
			}
		],
		petChance: 977_778,
		qpRequired: 1,
		clueScrollChance: 977_778,
		lostTicks: 0.33,
		bankingTime: 0,
		ticksPerRoll: 2
	},
	{
		name: 'Dark crab',
		alias: ['crab', 'dark'],
		subfishes: [
			{
				id: itemID('Raw dark crab'),
				level: 85,
				xp: 130,
				intercept: 0.023,
				slope: 0.0014
			}
		],
		petChance: 149_434,
		bait: itemID('Dark fishing bait'),
		clueScrollChance: 149_434,
		lostTicks: 0.1,
		bankingTime: 0,
		ticksPerRoll: 6
	},
	{
		name: 'Barbarian fishing',
		alias: ['barb', 'barbarian'],
		subfishes: [
			{
				id: itemID('Leaping trout'),
				level: 48,
				xp: 50,
				intercept: 32 / 255,
				slope: (192 - 32) / 255 / 98,
				bonusXP: { agility: 5, strength: 5, cooking: 10 }
			},
			{
				id: itemID('Leaping salmon'),
				level: 58,
				xp: 70,
				intercept: 16 / 255,
				slope: (96 - 16) / 255 / 98,
				bonusXP: { agility: 6, strength: 6, cooking: 10 }
			},
			{
				id: itemID('Leaping sturgeon'),
				level: 70,
				xp: 80,
				intercept: 8 / 255,
				slope: (64 - 8) / 255 / 98,
				bonusXP: { agility: 7, strength: 7, cooking: 15 }
			}
		],
		petChance: 426_954,
		bait: itemID('Feather'),
		clueScrollChance: 426_954,
		lostTicks: 0.09,
		bankingTime: 40,
		ticksPerRoll: 5,
		skillReqs: { agility: 15, strength: 15 }
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

export const Fishing = defineSkill({
	aliases: ['fishing'],
	Fishes: fishes,
	camdozaalFishes,
	id: 'fishing',
	emoji: Emoji.Fishing,
	anglerItems,
	name: 'Fishing',
	util: {
		calcFishingTripResult,
		calcRadasBlessingBoost,
		calcMinnowQuantityRange,
		calcAnglerBoostPercent,
		calcAnglerBonusXP,
		calcFishingTripStart
	}
});
