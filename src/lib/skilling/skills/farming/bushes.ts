import { itemID, resolveNameBank } from 'oldschooljs/dist/util';

import { Plant } from '../../types';

export const bushes: Plant[] = [
	{
		level: 99,
		plantXp: 290,
		checkXp: 14_335,
		harvestXp: 120,
		name: 'Avocado bush',
		aliases: ['avocado', 'avocado bush'],
		inputItems: resolveNameBank({ 'Avocado seed': 1 }),
		outputCrop: itemID('Avocado'),
		petChance: 14_400,
		seedType: 'bush',
		growthTime: 600,
		numOfStages: 6,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 15,
		protectionPayment: resolveNameBank({ Dragonfruit: 15 }),
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
			[110, 1]
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10,
		additionalPatchesByFarmGuildAndLvl: []
	},
	{
		level: 105,
		plantXp: 290,
		checkXp: 19_335,
		harvestXp: 120,
		name: 'Mango bush',
		aliases: ['mango', 'mango bush'],
		inputItems: resolveNameBank({ 'Mango seed': 1 }),
		outputCrop: itemID('Mango'),
		petChance: 14_400,
		seedType: 'bush',
		growthTime: 600,
		numOfStages: 6,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ Avocado: 15 }),
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
			[110, 1]
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10,
		additionalPatchesByFarmGuildAndLvl: []
	},
	{
		level: 111,
		plantXp: 290,
		checkXp: 22_335,
		harvestXp: 120,
		name: 'Lychee bush',
		aliases: ['lychee', 'lychee bush'],
		inputItems: resolveNameBank({ 'Lychee seed': 1 }),
		outputCrop: itemID('Lychee'),
		petChance: 14_400,
		seedType: 'bush',
		growthTime: 600,
		numOfStages: 6,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ Mango: 15 }),
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
			[110, 1]
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10,
		additionalPatchesByFarmGuildAndLvl: []
	}
];
