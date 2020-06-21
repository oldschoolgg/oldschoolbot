import { Plant } from '../../types';
import itemID from '../../../util/itemID';

const herbPlants: Plant[] = [
	{
		level: 9,
		plantXp: 0,
		checkXp: 11,
		harvestXp: 12.5,
		name: `Guam`,
		inputItems: { [itemID('Guam seed')]: 1 },
		outputCrop: itemID('Grimy guam leaf'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 25,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 14,
		plantXp: 0,
		checkXp: 13.5,
		harvestXp: 15,
		name: `Marrentill`,
		inputItems: { [itemID('Marrentill seed')]: 1 },
		outputCrop: itemID('Grimy marrentill'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 28,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 19,
		plantXp: 0,
		checkXp: 16,
		harvestXp: 18,
		name: `Tarromin`,
		inputItems: { [itemID('Tarromin seed')]: 1 },
		outputCrop: itemID('Grimy tarromin'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 31,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 26,
		plantXp: 0,
		checkXp: 21.5,
		harvestXp: 24,
		name: `Harralander`,
		inputItems: { [itemID('Harralander seed')]: 1 },
		outputCrop: itemID('Grimy harralander'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 36,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 32,
		plantXp: 0,
		checkXp: 27,
		harvestXp: 30.5,
		name: `Ranarr`,
		inputItems: { [itemID('Ranarr seed')]: 1 },
		outputCrop: itemID('Grimy ranarr weed'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 39,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 38,
		plantXp: 0,
		checkXp: 34,
		harvestXp: 38.5,
		name: `Toadflax`,
		inputItems: { [itemID('Toadflax seed')]: 1 },
		outputCrop: itemID('Grimy toadflax'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 43,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 44,
		plantXp: 0,
		checkXp: 43,
		harvestXp: 48.5,
		name: `Irit`,
		inputItems: { [itemID('Irit seed')]: 1 },
		outputCrop: itemID('Grimy irit leaf'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 46,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 50,
		plantXp: 0,
		checkXp: 54.5,
		harvestXp: 61.5,
		name: `Avantoe`,
		inputItems: { [itemID('Avantoe seed')]: 1 },
		outputCrop: itemID('Grimy avantoe'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 50,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 56,
		plantXp: 0,
		checkXp: 69,
		harvestXp: 78,
		name: `Kwuarm`,
		inputItems: { [itemID('Kwuarm seed')]: 1 },
		outputCrop: itemID('Grimy kwuarm'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 54,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 62,
		plantXp: 0,
		checkXp: 87.5,
		harvestXp: 98.5,
		name: `Snapdragon`,
		inputItems: { [itemID('Snapdragon seed')]: 1 },
		outputCrop: itemID('Grimy snapdragon'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 57,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 67,
		plantXp: 0,
		checkXp: 106.5,
		harvestXp: 120,
		name: `Cadantine`,
		inputItems: { [itemID('Cadantine seed')]: 1 },
		outputCrop: itemID('Grimy cadantine'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 60,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 73,
		plantXp: 0,
		checkXp: 134.5,
		harvestXp: 151.5,
		name: `Lantadyme`,
		inputItems: { [itemID('Lantadyme seed')]: 1 },
		outputCrop: itemID('Grimy lantadyme'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 64,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 79,
		plantXp: 0,
		checkXp: 170.5,
		harvestXp: 192,
		name: `Dwarf weed`,
		inputItems: { [itemID('Dwarf weed seed')]: 1 },
		outputCrop: itemID('Grimy dwarf weed'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 67,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	},
	{
		level: 85,
		plantXp: 0,
		checkXp: 199.5,
		harvestXp: 224.5,
		name: `Torstol`,
		inputItems: { [itemID('Torstol seed')]: 1 },
		outputCrop: itemID('Grimy torstol'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 71,
		chance99: 80,
		chanceOfDeath: 28,
		protectionPayment: 0, // not needed
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 5,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		]
	}
];

export default herbPlants;
