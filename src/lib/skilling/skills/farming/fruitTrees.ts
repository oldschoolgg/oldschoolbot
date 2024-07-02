import { Bank } from 'oldschooljs';

import itemID from '../../../util/itemID';
import type { Plant } from '../../types';

const fruitTrees: Plant[] = [
	{
		id: itemID('Cooking apple'),
		level: 27,
		plantXp: 22,
		checkXp: 1199.5,
		harvestXp: 8.5,
		name: 'Apple tree',
		aliases: ['apple tree', 'apple'],
		inputItems: new Bank({ 'Apple tree seed': 1 }).freeze(),
		outputCrop: itemID('Cooking apple'),
		petChance: 9000,
		seedType: 'fruit_tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ Sweetcorn: 9 }).freeze(),
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Banana'),
		level: 33,
		plantXp: 28,
		checkXp: 1750.5,
		harvestXp: 10.5,
		name: 'Banana tree',
		aliases: ['banana tree', 'banana'],
		inputItems: new Bank({ 'Banana tree seed': 1 }).freeze(),
		outputCrop: itemID('Banana'),
		petChance: 9000,
		seedType: 'fruit_tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ 'Apples(5)': 4 }).freeze(),
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Orange'),
		level: 39,
		plantXp: 35.5,
		checkXp: 2470.2,
		harvestXp: 13.5,
		name: 'Orange tree',
		aliases: ['orange tree', 'orange'],
		inputItems: new Bank({ 'Orange tree seed': 1 }).freeze(),
		outputCrop: itemID('Orange'),
		petChance: 9000,
		seedType: 'fruit_tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ 'Strawberries(5)': 3 }).freeze(),
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Curry leaf'),
		level: 42,
		plantXp: 40,
		checkXp: 2906.9,
		harvestXp: 15,
		name: 'Curry tree',
		aliases: ['curry tree', 'curry'],
		inputItems: new Bank({ 'Curry tree seed': 1 }).freeze(),
		outputCrop: itemID('Curry leaf'),
		petChance: 9000,
		seedType: 'fruit_tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ 'Bananas(5)': 5 }).freeze(),
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Pineapple'),
		level: 51,
		plantXp: 57,
		checkXp: 4605.7,
		harvestXp: 21.5,
		name: 'Pineapple tree',
		aliases: ['pineapple tree', 'pineapple'],
		inputItems: new Bank({ 'Pineapple seed': 1 }).freeze(),
		outputCrop: itemID('Pineapple'),
		petChance: 9000,
		seedType: 'fruit_tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ Watermelon: 10 }).freeze(),
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Papaya fruit'),
		level: 57,
		plantXp: 72,
		checkXp: 6146.4,
		harvestXp: 27,
		name: 'Papaya tree',
		aliases: ['papaya tree', 'papaya'],
		inputItems: new Bank({ 'Papaya tree seed': 1 }).freeze(),
		outputCrop: itemID('Papaya fruit'),
		petChance: 9000,
		seedType: 'fruit_tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ Pineapple: 10 }).freeze(),
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Coconut'),
		level: 68,
		plantXp: 110.5,
		checkXp: 10_150.1,
		harvestXp: 41.5,
		name: 'Palm tree',
		aliases: ['palm tree', 'palm', 'coconut'],
		inputItems: new Bank({ 'Palm tree seed': 1 }).freeze(),
		outputCrop: itemID('Coconut'),
		petChance: 9000,
		seedType: 'fruit_tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ 'Papaya fruit': 15 }).freeze(),
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Dragonfruit'),
		level: 81,
		plantXp: 140,
		checkXp: 17_335,
		harvestXp: 70,
		name: 'Dragonfruit tree',
		aliases: ['dragonfruit tree', 'dragonfruit'],
		inputItems: new Bank({ 'Dragonfruit tree seed': 1 }).freeze(),
		outputCrop: itemID('Dragonfruit'),
		petChance: 9000,
		seedType: 'fruit_tree',
		growthTime: 960,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ Coconut: 15 }).freeze(),
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	}
];

export default fruitTrees;
