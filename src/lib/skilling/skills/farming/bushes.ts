import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import type { Plant } from '../../types';

export const bushes: Plant[] = [
	{
		id: itemID('Avocado seed'),
		level: 99,
		plantXp: 290,
		checkXp: 14_335,
		harvestXp: 120,
		name: 'Avocado bush',
		aliases: ['avocado', 'avocado bush'],
		inputItems: new Bank({ 'Avocado seed': 1 }),
		outputCrop: itemID('Avocado'),
		petChance: 14_400,
		seedType: 'bush',
		growthTime: 600,
		numOfStages: 6,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 15,
		protectionPayment: new Bank({ Dragonfruit: 15 }),
		treeWoodcuttingLevel: 55,
		woodcuttingXp: 500,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[99, 1],
			[110, 2]
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10,
		additionalPatchesByFarmGuildAndLvl: []
	},
	{
		id: itemID('Mango seed'),
		level: 105,
		plantXp: 290,
		checkXp: 19_335,
		harvestXp: 120,
		name: 'Mango bush',
		aliases: ['mango', 'mango bush'],
		inputItems: new Bank({ 'Mango seed': 1 }),
		outputCrop: itemID('Mango'),
		petChance: 14_400,
		seedType: 'bush',
		growthTime: 600,
		numOfStages: 6,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ Avocado: 15 }),
		treeWoodcuttingLevel: 55,
		woodcuttingXp: 500,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[99, 1],
			[110, 2]
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10,
		additionalPatchesByFarmGuildAndLvl: []
	},
	{
		id: itemID('Lychee seed'),
		level: 111,
		plantXp: 290,
		checkXp: 22_335,
		harvestXp: 120,
		name: 'Lychee bush',
		aliases: ['lychee', 'lychee bush'],
		inputItems: new Bank({ 'Lychee seed': 1 }),
		outputCrop: itemID('Lychee'),
		petChance: 14_400,
		seedType: 'bush',
		growthTime: 600,
		numOfStages: 6,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ Mango: 15 }),
		treeWoodcuttingLevel: 55,
		woodcuttingXp: 500,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[99, 1],
			[110, 2]
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10,
		additionalPatchesByFarmGuildAndLvl: []
	},
	{
		id: itemID('Advax berry seed'),
		level: 111,
		plantXp: 290,
		checkXp: 22_335,
		harvestXp: 120,
		name: 'Advax bush',
		aliases: ['advax', 'advax bush'],
		inputItems: new Bank({ 'Advax berry seed': 1 }),
		outputCrop: itemID('Advax berry'),
		petChance: 14_400,
		seedType: 'bush',
		growthTime: 600,
		numOfStages: 6,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ Lychee: 15 }),
		treeWoodcuttingLevel: 55,
		woodcuttingXp: 500,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[99, 1],
			[110, 2]
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10,
		additionalPatchesByFarmGuildAndLvl: []
	}
];
