import { Plant } from '../../types';
import itemID from '../../../util/itemID';

const fruitTrees: Plant[] = [
	{
		level: 27,
		plantXp: 22,
		checkXp: 1_199.5,
		harvestXp: 8.5,
		name: `Apple`,
		inputItems: { [itemID(`Apple tree seed`)]: 1 },
		outputCrop: itemID('Cooking apple'),
		petChance: 9_000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17,
		protectionPayment: { [itemID('Sweetcorn')]: 9 },
		treeWoodcuttingLevel: 1,
		fixedOutputAmount: 6,
		woodcuttingXp: 0,
		needsChopForHarvest: true,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[22, 1] // Lletya Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guide High (1)
		]
	},
	{
		level: 33,
		plantXp: 28,
		checkXp: 1_750.5,
		harvestXp: 10.5,
		name: `Banana`,
		inputItems: { [itemID(`Banana tree seed`)]: 1 },
		outputCrop: itemID('Banana'),
		petChance: 9_000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17,
		protectionPayment: { [itemID('Apples(5)')]: 4 },
		treeWoodcuttingLevel: 1,
		fixedOutputAmount: 6,
		woodcuttingXp: 0,
		needsChopForHarvest: true,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[22, 1] // Lletya Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guide High (1)
		]
	},
	{
		level: 39,
		plantXp: 35.5,
		checkXp: 2_470.2,
		harvestXp: 13.5,
		name: `Orange`,
		inputItems: { [itemID(`Orange tree seed`)]: 1 },
		outputCrop: itemID('Orange'),
		petChance: 9_000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17,
		protectionPayment: { [itemID('Strawberries(5)')]: 3 },
		treeWoodcuttingLevel: 1,
		fixedOutputAmount: 6,
		woodcuttingXp: 0,
		needsChopForHarvest: true,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[22, 1] // Lletya Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guide High (1)
		]
	},
	{
		level: 42,
		plantXp: 40,
		checkXp: 2_906.9,
		harvestXp: 15,
		name: `Curry`,
		inputItems: { [itemID(`Curry tree seed`)]: 1 },
		outputCrop: itemID('Curry leaf'),
		petChance: 9_000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17,
		protectionPayment: { [itemID('Bananas(5)')]: 5 },
		treeWoodcuttingLevel: 1,
		fixedOutputAmount: 6,
		woodcuttingXp: 0,
		needsChopForHarvest: true,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[22, 1] // Lletya Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guide High (1)
		]
	},
	{
		level: 51,
		plantXp: 57,
		checkXp: 4_605.7,
		harvestXp: 21.5,
		name: `Pineapple`,
		inputItems: { [itemID(`Pineapple seed`)]: 1 },
		outputCrop: itemID('Pineapple'),
		petChance: 9_000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17,
		protectionPayment: { [itemID('Watermelon')]: 10 },
		treeWoodcuttingLevel: 1,
		fixedOutputAmount: 6,
		woodcuttingXp: 0,
		needsChopForHarvest: true,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[22, 1] // Lletya Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guide High (1)
		]
	},
	{
		level: 57,
		plantXp: 72,
		checkXp: 6_146.4,
		harvestXp: 27,
		name: `Papaya`,
		inputItems: { [itemID(`Papaya tree seed`)]: 1 },
		outputCrop: itemID('Papaya fruit'),
		petChance: 9_000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17,
		protectionPayment: { [itemID('Pineapple')]: 10 },
		treeWoodcuttingLevel: 1,
		fixedOutputAmount: 6,
		woodcuttingXp: 0,
		needsChopForHarvest: true,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[22, 1] // Lletya Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guide High (1)
		]
	},
	{
		level: 68,
		plantXp: 110.5,
		checkXp: 10_150.1,
		harvestXp: 41.5,
		name: `Palm`,
		inputItems: { [itemID(`Palm tree seed`)]: 1 },
		outputCrop: itemID('Coconut'),
		petChance: 9_000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17,
		protectionPayment: { [itemID('Papaya fruit')]: 15 },
		treeWoodcuttingLevel: 1,
		fixedOutputAmount: 6,
		woodcuttingXp: 0,
		needsChopForHarvest: true,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[22, 1] // Lletya Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guide High (1)
		]
	},
	{
		level: 81,
		plantXp: 140,
		checkXp: 17_335,
		harvestXp: 70,
		name: `Dragonfruit`,
		inputItems: { [itemID(`Dragonfruit tree seed`)]: 1 },
		outputCrop: itemID('Dragonfruit'),
		petChance: 9_000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17,
		protectionPayment: { [itemID('Coconut')]: 15 },
		treeWoodcuttingLevel: 1,
		fixedOutputAmount: 6,
		woodcuttingXp: 0,
		needsChopForHarvest: true,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[22, 1] // Lletya Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guide High (1)
		]
	}
];

export default fruitTrees;
