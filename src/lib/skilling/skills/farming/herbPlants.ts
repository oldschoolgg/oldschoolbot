import { resolveNameBank } from '../../../util';
import itemID from '../../../util/itemID';
import { Plant } from '../../types';

const herbPlants: Plant[] = [
	{
		level: 9,
		plantXp: 0,
		checkXp: 11,
		harvestXp: 12.5,
		name: `Guam`,
		aliases: ['guam weed', 'guam'],
		inputItems: resolveNameBank({ 'Guam seed': 1 }),
		outputCrop: itemID('Grimy guam leaf'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 25,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 14,
		plantXp: 0,
		checkXp: 13.5,
		harvestXp: 15,
		name: `Marrentill`,
		aliases: ['marrentill weed', 'marrentill'],
		inputItems: resolveNameBank({ 'Marrentill seed': 1 }),
		outputCrop: itemID('Grimy marrentill'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 28,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 19,
		plantXp: 0,
		checkXp: 16,
		harvestXp: 18,
		name: `Tarromin`,
		aliases: ['tarromin weed', 'tarromin'],
		inputItems: resolveNameBank({ 'Tarromin seed': 1 }),
		outputCrop: itemID('Grimy tarromin'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 31,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 26,
		plantXp: 0,
		checkXp: 21.5,
		harvestXp: 24,
		name: `Harralander`,
		aliases: ['harralander weed', 'harralander'],
		inputItems: resolveNameBank({ 'Harralander seed': 1 }),
		outputCrop: itemID('Grimy harralander'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 36,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 32,
		plantXp: 0,
		checkXp: 27,
		harvestXp: 30.5,
		name: `Ranarr`,
		aliases: ['ranarr weed', 'ranarr'],
		inputItems: resolveNameBank({ 'Ranarr seed': 1 }),
		outputCrop: itemID('Grimy ranarr weed'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 39,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 38,
		plantXp: 0,
		checkXp: 34,
		harvestXp: 38.5,
		name: `Toadflax`,
		aliases: ['toadflax weed', 'toadflax'],
		inputItems: resolveNameBank({ 'Toadflax seed': 1 }),
		outputCrop: itemID('Grimy toadflax'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 43,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 44,
		plantXp: 0,
		checkXp: 43,
		harvestXp: 48.5,
		name: `Irit`,
		aliases: ['irit weed', 'irit'],
		inputItems: resolveNameBank({ 'Irit seed': 1 }),
		outputCrop: itemID('Grimy irit leaf'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 46,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 50,
		plantXp: 0,
		checkXp: 54.5,
		harvestXp: 61.5,
		name: `Avantoe`,
		aliases: ['avantoe weed', 'avantoe'],
		inputItems: resolveNameBank({ 'Avantoe seed': 1 }),
		outputCrop: itemID('Grimy avantoe'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 50,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 56,
		plantXp: 0,
		checkXp: 69,
		harvestXp: 78,
		name: `Kwuarm`,
		aliases: ['kwuarm weed', 'kwuarm'],
		inputItems: resolveNameBank({ 'Kwuarm seed': 1 }),
		outputCrop: itemID('Grimy kwuarm'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 54,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 62,
		plantXp: 0,
		checkXp: 87.5,
		harvestXp: 98.5,
		name: `Snapdragon`,
		aliases: ['snapdragon weed', 'snapdragon'],
		inputItems: resolveNameBank({ 'Snapdragon seed': 1 }),
		outputCrop: itemID('Grimy snapdragon'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 57,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 67,
		plantXp: 0,
		checkXp: 106.5,
		harvestXp: 120,
		name: `Cadantine`,
		aliases: ['cadantine weed', 'cadantine'],
		inputItems: resolveNameBank({ 'Cadantine seed': 1 }),
		outputCrop: itemID('Grimy cadantine'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 60,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 73,
		plantXp: 0,
		checkXp: 134.5,
		harvestXp: 151.5,
		name: `Lantadyme`,
		aliases: ['lantadyme weed', 'lantadyme'],
		inputItems: resolveNameBank({ 'Lantadyme seed': 1 }),
		outputCrop: itemID('Grimy lantadyme'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 64,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 79,
		plantXp: 0,
		checkXp: 170.5,
		harvestXp: 192,
		name: `Dwarf weed`,
		aliases: ['dwarf weed', 'dwarf'],
		inputItems: resolveNameBank({ 'Dwarf weed seed': 1 }),
		outputCrop: itemID('Grimy dwarf weed'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 67,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 85,
		plantXp: 0,
		checkXp: 199.5,
		harvestXp: 224.5,
		name: `Torstol`,
		aliases: ['torstol weed', 'torstol'],
		inputItems: resolveNameBank({ 'Torstol seed': 1 }),
		outputCrop: itemID('Grimy torstol'),
		petChance: 98_364,
		seedType: 'herb',
		growthTime: 80,
		numOfStages: 4,
		chance1: 71,
		chance99: 80,
		chanceOfDeath: 28,
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
			[1, 1], // Canifs Patches (1)
			[10, 2], // Troll Stronghold (1)
			[15, 3], // Harmony Island Patch (1)
			[31, 4] // Weiss Patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guide Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	}
];

export default herbPlants;
