import { Bank } from 'oldschooljs';

import itemID from '../../../util/itemID';
import type { Plant } from '../../types';

const specialPlants: Plant[] = [
	{
		id: itemID('Marigolds'),
		level: 2,
		plantXp: 8.5,
		checkXp: 0,
		harvestXp: 47,
		inputItems: new Bank({ 'Marigold seed': 1 }).freeze(),
		outputCrop: itemID('Marigolds'),
		variableYield: false,
		name: 'Marigold',
		aliases: ['marigolds', 'marigold'],
		petChance: 281_040,
		seedType: 'flower',
		growthTime: 20,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 25,
		needsChopForHarvest: false,
		fixedOutputAmount: 1,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patch
			[33, 1] // Prif Patch
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild
		],
		timePerPatchTravel: 20,
		timePerHarvest: 5
	},
	{
		id: itemID('Redberries'),
		level: 10,
		plantXp: 11.5,
		checkXp: 64,
		harvestXp: 4.5,
		inputItems: new Bank({ 'Redberry seed': 1 }).freeze(),
		outputCrop: itemID('Redberries'),
		name: 'Redberry',
		aliases: ['redberry', 'redberries'],
		petChance: 44_966,
		seedType: 'bush',
		growthTime: 100,
		numOfStages: 5,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17, // needs data
		protectionPayment: new Bank({ Cabbage: 20 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 3,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 1] // Etceteria patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild Low (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Rosemary'),
		level: 11,
		plantXp: 12,
		checkXp: 0,
		harvestXp: 66.5,
		inputItems: new Bank({ 'Rosemary seed': 1 }).freeze(),
		outputCrop: itemID('Rosemary'),
		variableYield: false,
		name: 'Rosemary',
		aliases: ['rosemarys', 'rosemary'],
		petChance: 281_040,
		seedType: 'flower',
		growthTime: 20,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 25,
		needsChopForHarvest: false,
		fixedOutputAmount: 1,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patch
			[33, 1] // Prif Patch
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild
		],
		timePerPatchTravel: 20,
		timePerHarvest: 5
	},
	{
		id: itemID('Cadava berries'),
		level: 22,
		plantXp: 18,
		checkXp: 102.5,
		harvestXp: 7,
		inputItems: new Bank({ 'Cadavaberry seed': 1 }).freeze(),
		outputCrop: itemID('Cadava berries'),
		name: 'Cadavaberry',
		aliases: ['cadavaberry', 'cadavaberries', 'cadava berries', 'cadava', 'cadava berry'],
		petChance: 37_472,
		seedType: 'bush',
		growthTime: 120,
		numOfStages: 6,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17, // needs data
		protectionPayment: new Bank({ Tomato: 15 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 3,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 1] // Etceteria patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild Low (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Giant seaweed'),
		level: 23,
		plantXp: 19,
		checkXp: 0,
		harvestXp: 21,
		inputItems: new Bank({ 'Seaweed spore': 1 }).freeze(),
		outputCrop: itemID('Giant seaweed'),
		name: 'Seaweed',
		aliases: ['seaweed'],
		petChance: 7500,
		seedType: 'seaweed',
		growthTime: 40,
		numOfStages: 4,
		chance1: 149,
		chance99: 208,
		chanceOfDeath: 20,
		protectionPayment: new Bank({ Numulite: 200 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 2] // Underwater Fossil Island (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Nasturtiums'),
		level: 24,
		plantXp: 19.5,
		checkXp: 0,
		harvestXp: 111,
		inputItems: new Bank({ 'Nasturtium seed': 1 }).freeze(),
		outputCrop: itemID('Nasturtiums'),
		variableYield: false,
		name: 'Nasturtium',
		aliases: ['nasturtiums', 'nasturtium'],
		petChance: 281_040,
		seedType: 'flower',
		growthTime: 20,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 25,
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patch
			[33, 1] // Prif Patch
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild
		],
		timePerPatchTravel: 20,
		timePerHarvest: 5
	},
	{
		id: itemID('Woad leaf'),
		level: 25,
		plantXp: 20.5,
		checkXp: 0,
		harvestXp: 115.5,
		inputItems: new Bank({ 'Woad seed': 1 }).freeze(),
		outputCrop: itemID('Woad leaf'),
		variableYield: false,
		name: 'Woad leaf',
		aliases: ['Woad leaf', 'woad'],
		petChance: 281_040,
		seedType: 'flower',
		growthTime: 20,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 25,
		needsChopForHarvest: false,
		fixedOutputAmount: 3,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patch
			[33, 1] // Prif Patch
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild
		],
		timePerPatchTravel: 20,
		timePerHarvest: 5
	},
	{
		id: itemID('Limpwurt root'),
		level: 26,
		plantXp: 21.5,
		checkXp: 0,
		harvestXp: 120,
		inputItems: new Bank({ 'Limpwurt seed': 1 }).freeze(),
		outputCrop: itemID('Limpwurt root'),
		variableYield: true,
		name: 'Limpwurt',
		aliases: ['limpwurt', 'limp'],
		petChance: 224_832,
		seedType: 'flower',
		growthTime: 20,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 25,
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patch
			[33, 1] // Prif Patch
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild
		],
		timePerPatchTravel: 20,
		timePerHarvest: 5
	},
	{
		id: itemID('Teak logs'),
		level: 35,
		plantXp: 35,
		checkXp: 7290,
		harvestXp: 0,
		inputItems: new Bank({ 'Teak seed': 1 }).freeze(),
		outputLogs: itemID('Teak logs'),
		treeWoodcuttingLevel: 35,
		name: 'Teak tree',
		aliases: ['teak tree', 'teak', 'teaks'],
		petChance: 5000,
		seedType: 'hardwood',
		growthTime: 3840,
		numOfStages: 8,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 15,
		protectionPayment: new Bank({ 'Limpwurt root': 15 }).freeze(),
		woodcuttingXp: 85,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 3] // Fossil Island (3)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [],
		timePerPatchTravel: 7,
		timePerHarvest: 10
	},
	{
		id: itemID('Grapes'),
		level: 36,
		plantXp: 31.5,
		checkXp: 625,
		harvestXp: 40,
		inputItems: new Bank({ 'Grape seed': 1, Saltpetre: 1 }).freeze(),
		outputCrop: itemID('Grapes'),
		name: 'Grape',
		aliases: ['grape', 'grapes'],
		petChance: 385_426,
		seedType: 'vine',
		growthTime: 35,
		numOfStages: 7,
		chance1: 139.8,
		chance99: 206.36,
		chanceOfDeath: 0,
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 12,
		canPayFarmer: false,
		canCompostPatch: false,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [],
		timePerPatchTravel: 2,
		timePerHarvest: 15
	},
	{
		id: itemID('Dwellberries'),
		level: 36,
		plantXp: 31.5,
		checkXp: 177.5,
		harvestXp: 12,
		inputItems: new Bank({ 'Dwellberry seed': 1 }).freeze(),
		outputCrop: itemID('Dwellberries'),
		name: 'Dwellberry',
		aliases: ['dwellberry', 'dwellberries'],
		petChance: 32_119,
		seedType: 'bush',
		growthTime: 140,
		numOfStages: 7,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17, // needs data
		protectionPayment: new Bank({ Strawberry: 15 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 3,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 1] // Etceteria patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild Low (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Jangerberries'),
		level: 48,
		plantXp: 50.5,
		checkXp: 284.5,
		harvestXp: 19,
		inputItems: new Bank({ 'Jangerberry seed': 1 }).freeze(),
		outputCrop: itemID('Jangerberries'),
		name: 'Jangerberry',
		aliases: ['jangerberry', 'jangerberries'],
		petChance: 28_104,
		seedType: 'bush',
		growthTime: 160,
		numOfStages: 8,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17, // needs data
		protectionPayment: new Bank({ Watermelon: 6 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 3,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 1] // Etceteria patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild Low (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Mushroom'),
		level: 53,
		plantXp: 61.5,
		checkXp: 0,
		harvestXp: 57.7,
		inputItems: new Bank({ 'Mushroom spore': 1 }).freeze(),
		outputCrop: itemID('Mushroom'),
		name: 'Mushroom',
		aliases: ['mushroom', 'mush'],
		petChance: 7500,
		seedType: 'mushroom',
		growthTime: 240,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		needsChopForHarvest: false,
		fixedOutput: true,
		fixedOutputAmount: 6,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 0,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1] // Canifs patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [],
		timePerPatchTravel: 10,
		timePerHarvest: 5
	},
	{
		id: itemID('Cactus spine'),
		level: 55,
		plantXp: 66.5,
		checkXp: 374,
		harvestXp: 25,
		inputItems: new Bank({ 'Cactus seed': 1 }).freeze(),
		outputCrop: itemID('Cactus spine'),
		name: 'Cactus',
		aliases: ['cactus'],
		petChance: 7000,
		seedType: 'cactus',
		growthTime: 560,
		numOfStages: 7,
		chance1: -78.38,
		chance99: 178.2,
		chanceOfDeath: 15,
		protectionPayment: new Bank({ 'Cadava berries': 6 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 1,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guide Low (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Mahogany logs'),
		level: 55,
		plantXp: 63,
		checkXp: 15_720,
		harvestXp: 0,
		inputItems: new Bank({ 'Mahogany seed': 1 }).freeze(),
		outputLogs: itemID('Mahogany logs'),
		treeWoodcuttingLevel: 50,
		name: 'Mahogany tree',
		aliases: ['mahogany tree', 'mahogany', 'mahog'],
		petChance: 5000,
		seedType: 'hardwood',
		growthTime: 5120,
		numOfStages: 8,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 12,
		protectionPayment: new Bank({ 'Yanillian hops': 25 }).freeze(),
		woodcuttingXp: 125,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 3] // Fossil Island (3)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [],
		timePerPatchTravel: 7,
		timePerHarvest: 10
	},
	{
		id: itemID('White lily'),
		level: 58,
		plantXp: 42,
		checkXp: 0,
		harvestXp: 250,
		inputItems: new Bank({ 'White lily seed': 1 }).freeze(),
		outputCrop: itemID('White lily'),
		variableYield: false,
		name: 'White lily',
		aliases: ['white lily', 'white lilies'],
		petChance: 281_040,
		seedType: 'flower',
		growthTime: 20,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 25,
		needsChopForHarvest: false,
		fixedOutputAmount: 1,
		fixedOutput: true,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 4,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patch
			[33, 1] // Prif Patch
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild
		],
		timePerPatchTravel: 20,
		timePerHarvest: 5
	},
	{
		id: itemID('White berries'),
		level: 59,
		plantXp: 78,
		checkXp: 437.5,
		harvestXp: 29,
		inputItems: new Bank({ 'Whiteberry seed': 1 }).freeze(),
		outputCrop: itemID('White berries'),
		name: 'Whiteberry',
		aliases: ['whiteberry', 'whiteberries'],
		petChance: 28_104,
		seedType: 'bush',
		growthTime: 160,
		numOfStages: 8,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 15,
		protectionPayment: new Bank({ Mushroom: 8 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 3,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 1] // Etceteria patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild Low (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Cave nightshade'),
		level: 63,
		plantXp: 91,
		checkXp: 0,
		harvestXp: 512,
		inputItems: new Bank({ 'Belladonna seed': 1 }).freeze(),
		outputCrop: itemID('Cave nightshade'),
		variableYield: true,
		name: 'Belladonna',
		aliases: ['belladonna', 'bella', 'nightshade'],
		petChance: 8000,
		seedType: 'belladonna',
		growthTime: 320,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 1,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [],
		timePerPatchTravel: 15,
		timePerHarvest: 5
	},
	{
		id: itemID('Potato cactus'),
		level: 64,
		plantXp: 68,
		checkXp: 230,
		harvestXp: 68,
		inputItems: new Bank({ 'Potato cactus seed': 1 }).freeze(),
		outputCrop: itemID('Potato cactus'),
		name: 'Potato cactus',
		aliases: ['potato cactus'],
		petChance: 160_594,
		seedType: 'cactus',
		growthTime: 70,
		numOfStages: 7,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 12,
		protectionPayment: new Bank({ 'Snape grass': 8 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 1,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guide Low (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Hespori seed'),
		level: 65,
		plantXp: 62,
		checkXp: 12_600,
		harvestXp: 0,
		inputItems: new Bank({ 'Hespori seed': 1 }).freeze(),
		name: 'Hespori',
		aliases: ['hespori'],
		petChance: 7000,
		seedType: 'hespori',
		growthTime: 1920,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 0,
		protectionPayment: new Bank(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: false,
		defaultNumOfPatches: 0,
		canPayFarmer: false,
		canCompostPatch: false,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guide Medium (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 90
	},
	{
		id: itemID('Poison ivy berries'),
		level: 70,
		plantXp: 120,
		checkXp: 675,
		harvestXp: 45,
		inputItems: new Bank({ 'Poison ivy seed': 1 }).freeze(),
		outputCrop: itemID('Poison ivy berries'),
		name: 'Poison ivy',
		aliases: ['poison ivy'],
		petChance: 28_104,
		seedType: 'bush',
		growthTime: 160,
		numOfStages: 8,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 0,
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 3,
		canPayFarmer: false,
		canCompostPatch: false,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 1] // Etceteria patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 1] // Farming Guild Low (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Calquat fruit'),
		level: 72,
		plantXp: 129.5,
		checkXp: 12_096,
		harvestXp: 48.5,
		inputItems: new Bank({ 'Calquat tree seed': 1 }).freeze(),
		outputCrop: itemID('Calquat fruit'),
		treeWoodcuttingLevel: 1,
		name: 'Calquat tree',
		aliases: ['calquat tree', 'calquat'],
		petChance: 6000,
		seedType: 'calquat',
		growthTime: 1280,
		numOfStages: 8,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: new Bank({ 'Poison ivy berries': 8 }).freeze(),
		needsChopForHarvest: true,
		fixedOutput: true,
		fixedOutputAmount: 6,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 1,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Crystal shard'),
		level: 74,
		plantXp: 126,
		checkXp: 13_240,
		harvestXp: 0,
		inputItems: new Bank({ 'Crystal acorn': 1 }).freeze(),
		outputCrop: itemID('Crystal shard'),
		variableYield: true,
		variableOutputAmount: [
			[null, 8, 10],
			['compost', 10, 12],
			['supercompost', 12, 14],
			['ultracompost', 28, 32]
		],
		treeWoodcuttingLevel: 1,
		name: 'Crystal tree',
		aliases: ['crystal tree', 'crystal'],
		petChance: 9000,
		seedType: 'crystal',
		growthTime: 480,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 0,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 0,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[33, 1] // Prifddinas (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [],
		timePerPatchTravel: 20,
		timePerHarvest: 5
	},
	{
		id: itemID('Spirit seed'),
		level: 83,
		plantXp: 199.5,
		checkXp: 19_301,
		harvestXp: 0,
		inputItems: new Bank({ 'Spirit seed': 1 }).freeze(),
		treeWoodcuttingLevel: 1,
		name: 'Spirit tree',
		aliases: ['spirit tree', 'spirit'],
		petChance: 5000,
		seedType: 'spirit',
		growthTime: 3840,
		numOfStages: 12,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 8,
		protectionPayment: new Bank({
			'Monkey nuts': 5,
			'Monkey bar': 1,
			'Ground tooth': 1
		}).freeze(),
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: false,
		defaultNumOfPatches: 1,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[99, 3] // Plant in all patches at lvl 99
		],
		additionalPatchesByFarmGuildAndLvl: [
			[91, 1] // Plant up to 2 seeds at lvl 91 with farm guild
		],
		timePerPatchTravel: 20,
		timePerHarvest: 1
	},
	{
		id: itemID('Celastrus bark'),
		level: 85,
		plantXp: 204,
		checkXp: 14_130,
		harvestXp: 23.5,
		inputItems: new Bank({ 'Celastrus seed': 1 }).freeze(),
		outputCrop: itemID('Celastrus bark'),
		treeWoodcuttingLevel: 1,
		name: 'Celastrus tree',
		aliases: ['celastrus tree', 'celastrus'],
		petChance: 9000,
		seedType: 'celastrus',
		growthTime: 800,
		numOfStages: 5,
		chance1: -26.6,
		chance99: 63,
		chanceOfDeath: 15,
		protectionPayment: new Bank({ 'Potato cactus': 8 }).freeze(),
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 10,
		timePerHarvest: 10
	},
	{
		id: itemID('Redwood logs'),
		level: 90,
		plantXp: 230,
		checkXp: 22_450,
		harvestXp: 0,
		inputItems: new Bank({ 'Redwood tree seed': 1 }).freeze(),
		outputLogs: itemID('Redwood logs'),
		treeWoodcuttingLevel: 90,
		name: 'Redwood tree',
		aliases: ['redwood tree', 'redwood'],
		petChance: 5000,
		seedType: 'redwood',
		growthTime: 6400,
		numOfStages: 11,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 8,
		protectionPayment: new Bank({ Dragonfruit: 6 }).freeze(),
		woodcuttingXp: 380,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[85, 1] // Farming Guild High (1)
		],
		timePerPatchTravel: 10,
		timePerHarvest: 15
	}
];

export default specialPlants;
