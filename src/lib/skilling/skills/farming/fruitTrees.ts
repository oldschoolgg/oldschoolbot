import { resolveNameBank } from '../../../util';
import itemID from '../../../util/itemID';
import { Plant } from '../../types';

const fruitTrees: Plant[] = [
	{
		level: 27,
		plantXp: 22,
		checkXp: 1199.5,
		harvestXp: 8.5,
		name: 'Apple tree',
		aliases: ['apple tree', 'apple'],
		inputItems: resolveNameBank({ 'Apple tree seed': 1 }),
		outputCrop: itemID('Cooking apple'),
		petChance: 9000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ Sweetcorn: 9 }),
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
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 33,
		plantXp: 28,
		checkXp: 1750.5,
		harvestXp: 10.5,
		name: 'Banana tree',
		aliases: ['banana tree', 'banana'],
		inputItems: resolveNameBank({ 'Banana tree seed': 1 }),
		outputCrop: itemID('Banana'),
		petChance: 9000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ 'Apples(5)': 4 }),
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
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 39,
		plantXp: 35.5,
		checkXp: 2470.2,
		harvestXp: 13.5,
		name: 'Orange tree',
		aliases: ['orange tree', 'orange'],
		inputItems: resolveNameBank({ 'Orange tree seed': 1 }),
		outputCrop: itemID('Orange'),
		petChance: 9000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ 'Strawberries(5)': 3 }),
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
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 42,
		plantXp: 40,
		checkXp: 2906.9,
		harvestXp: 15,
		name: 'Curry tree',
		aliases: ['curry tree', 'curry'],
		inputItems: resolveNameBank({ 'Curry tree seed': 1 }),
		outputCrop: itemID('Curry leaf'),
		petChance: 9000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ 'Bananas(5)': 5 }),
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
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 51,
		plantXp: 57,
		checkXp: 4605.7,
		harvestXp: 21.5,
		name: 'Pineapple tree',
		aliases: ['pineapple tree', 'pineapple'],
		inputItems: resolveNameBank({ 'Pineapple seed': 1 }),
		outputCrop: itemID('Pineapple'),
		petChance: 9000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ Watermelon: 10 }),
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
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 57,
		plantXp: 72,
		checkXp: 6146.4,
		harvestXp: 27,
		name: 'Papaya tree',
		aliases: ['papaya tree', 'papaya'],
		inputItems: resolveNameBank({ 'Papaya tree seed': 1 }),
		outputCrop: itemID('Papaya fruit'),
		petChance: 9000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ Pineapple: 10 }),
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
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 68,
		plantXp: 110.5,
		checkXp: 10_150.1,
		harvestXp: 41.5,
		name: 'Palm tree',
		aliases: ['palm tree', 'palm', 'coconut'],
		inputItems: resolveNameBank({ 'Palm tree seed': 1 }),
		outputCrop: itemID('Coconut'),
		petChance: 9000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ 'Papaya fruit': 15 }),
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
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 81,
		plantXp: 140,
		checkXp: 17_335,
		harvestXp: 70,
		name: 'Dragonfruit tree',
		aliases: ['dragonfruit tree', 'dragonfruit'],
		inputItems: resolveNameBank({ 'Dragonfruit tree seed': 1 }),
		outputCrop: itemID('Dragonfruit'),
		petChance: 9000,
		seedType: 'fruit tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: resolveNameBank({ Coconut: 15 }),
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
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	}
];

export default fruitTrees;
