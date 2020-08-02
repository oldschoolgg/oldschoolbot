import { Plant } from '../../types';
import itemID from '../../../util/itemID';
import { resolveNameBank } from '../../../util';

const allotmentPlants: Plant[] = [
	{
		level: 1,
		plantXp: 8,
		checkXp: 0,
		harvestXp: 9,
		inputItems: resolveNameBank({ 'Potato seed': 3 }),
		outputCrop: itemID('Potato'),
		name: `Potato`,
		aliases: ['potato'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: resolveNameBank({ Compost: 2 }),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 6,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 2], // Canifs Patches (2)
			[15, 3], // Harmony Island Patch (1)
			[33, 5] // Prifddinas (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 2] // Farming Guide Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		level: 5,
		plantXp: 9.5,
		checkXp: 0,
		harvestXp: 10.5,
		inputItems: resolveNameBank({ 'Onion seed': 3 }),
		outputCrop: itemID('Onion'),
		name: `Onion`,
		aliases: ['onion'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: resolveNameBank({ 'Potatoes(10)': 1 }),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 6,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 2], // Canifs Patches (2)
			[15, 3], // Harmony Island Patch (1)
			[33, 5] // Prifddinas (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 2] // Farming Guide Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		level: 7,
		plantXp: 10,
		checkXp: 0,
		harvestXp: 10.5,
		inputItems: resolveNameBank({ 'Cabbage seed': 3 }),
		outputCrop: itemID('Cabbage'),
		name: `Cabbage`,
		aliases: ['cabbage'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: resolveNameBank({ 'Onions(10)': 1 }),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 6,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 2], // Canifs Patches (2)
			[15, 3], // Harmony Island Patch (1)
			[33, 5] // Prifddinas (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 2] // Farming Guide Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		level: 12,
		plantXp: 12.5,
		checkXp: 0,
		harvestXp: 14,
		inputItems: resolveNameBank({ 'Tomato seed': 3 }),
		outputCrop: itemID('Tomato'),
		name: `Tomato`,
		aliases: ['tomato'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: resolveNameBank({ 'Cabbages(10)': 2 }),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 6,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 2], // Canifs Patches (2)
			[15, 3], // Harmony Island Patch (1)
			[33, 5] // Prifddinas (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 2] // Farming Guide Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		level: 20,
		plantXp: 17,
		checkXp: 0,
		harvestXp: 19,
		inputItems: resolveNameBank({ 'Sweetcorn seed': 3 }),
		outputCrop: itemID('Sweetcorn'),
		name: `Sweetcorn`,
		aliases: ['sweetcorn'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 60,
		numOfStages: 6,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: resolveNameBank({ 'Jute fibre': 10 }),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 6,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 2], // Canifs Patches (2)
			[15, 3], // Harmony Island Patch (1)
			[33, 5] // Prifddinas (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 2] // Farming Guide Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		level: 31,
		plantXp: 26,
		checkXp: 0,
		harvestXp: 29,
		inputItems: resolveNameBank({ 'Strawberry seed': 3 }),
		outputCrop: itemID('Strawberry'),
		name: `Strawberry`,
		aliases: ['strawberry'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 60,
		numOfStages: 6,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: resolveNameBank({ 'Apples(5)': 1 }),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 6,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 2], // Canifs Patches (2)
			[15, 3], // Harmony Island Patch (1)
			[33, 5] // Prifddinas (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 2] // Farming Guide Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		level: 47,
		plantXp: 48.5,
		checkXp: 0,
		harvestXp: 54.5,
		inputItems: resolveNameBank({ 'Watermelon seed': 3 }),
		outputCrop: itemID('Watermelon'),
		name: `Watermelon`,
		aliases: ['watermelon'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 80,
		numOfStages: 8,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: resolveNameBank({ 'Curry leaf': 10 }),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 6,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 2], // Canifs Patches (2)
			[15, 3], // Harmony Island Patch (1)
			[33, 5] // Prifddinas (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 2] // Farming Guide Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		level: 61,
		plantXp: 82,
		checkXp: 0,
		harvestXp: 82,
		inputItems: resolveNameBank({ 'Snape grass seed': 3 }),
		outputCrop: itemID('Snape grass'),
		name: `Snape grass`,
		aliases: ['snape grass'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 70,
		numOfStages: 7,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: resolveNameBank({ Jangerberries: 5 }),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 6,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 2], // Canifs Patches (2)
			[15, 3], // Harmony Island Patch (1)
			[33, 5] // Prifddinas (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 2] // Farming Guide Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	}
];

export default allotmentPlants;
