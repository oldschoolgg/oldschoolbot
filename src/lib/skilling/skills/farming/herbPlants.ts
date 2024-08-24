import { Bank } from 'oldschooljs';

import itemID from '../../../util/itemID';
import type { Plant } from '../../types';

const herbPlants: Plant[] = [
	{
		id: itemID('Grimy guam leaf'),
		level: 9,
		plantXp: 0,
		checkXp: 11,
		harvestXp: 12.5,
		name: 'Guam',
		aliases: ['guam weed', 'guam'],
		inputItems: new Bank({ 'Guam seed': 1 }).freeze(),
		outputCrop: itemID('Grimy guam leaf'),
		cleanHerbCrop: itemID('Guam leaf'),
		herbXp: 2.5,
		herbLvl: 3,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy marrentill'),
		level: 14,
		plantXp: 0,
		checkXp: 13.5,
		harvestXp: 15,
		name: 'Marrentill',
		aliases: ['marrentill weed', 'marrentill'],
		inputItems: new Bank({ 'Marrentill seed': 1 }).freeze(),
		outputCrop: itemID('Grimy marrentill'),
		cleanHerbCrop: itemID('Marrentill'),
		herbXp: 3.8,
		herbLvl: 5,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy tarromin'),
		level: 19,
		plantXp: 0,
		checkXp: 16,
		harvestXp: 18,
		name: 'Tarromin',
		aliases: ['tarromin weed', 'tarromin'],
		inputItems: new Bank({ 'Tarromin seed': 1 }).freeze(),
		outputCrop: itemID('Grimy tarromin'),
		cleanHerbCrop: itemID('Tarromin'),
		herbXp: 5,
		herbLvl: 11,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy harralander'),
		level: 26,
		plantXp: 0,
		checkXp: 21.5,
		harvestXp: 24,
		name: 'Harralander',
		aliases: ['harralander weed', 'harralander'],
		inputItems: new Bank({ 'Harralander seed': 1 }).freeze(),
		outputCrop: itemID('Grimy harralander'),
		cleanHerbCrop: itemID('Harralander'),
		herbXp: 6.3,
		herbLvl: 20,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy ranarr weed'),
		level: 32,
		plantXp: 0,
		checkXp: 27,
		harvestXp: 30.5,
		name: 'Ranarr',
		aliases: ['ranarr weed', 'ranarr'],
		inputItems: new Bank({ 'Ranarr seed': 1 }).freeze(),
		outputCrop: itemID('Grimy ranarr weed'),
		cleanHerbCrop: itemID('Ranarr weed'),
		herbXp: 7.5,
		herbLvl: 25,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy toadflax'),
		level: 38,
		plantXp: 0,
		checkXp: 34,
		harvestXp: 38.5,
		name: 'Toadflax',
		aliases: ['toadflax weed', 'toadflax'],
		inputItems: new Bank({ 'Toadflax seed': 1 }).freeze(),
		outputCrop: itemID('Grimy toadflax'),
		cleanHerbCrop: itemID('Toadflax'),
		herbXp: 8,
		herbLvl: 30,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy irit leaf'),
		level: 44,
		plantXp: 0,
		checkXp: 43,
		harvestXp: 48.5,
		name: 'Irit',
		aliases: ['irit weed', 'irit'],
		inputItems: new Bank({ 'Irit seed': 1 }).freeze(),
		outputCrop: itemID('Grimy irit leaf'),
		cleanHerbCrop: itemID('Irit leaf'),
		herbXp: 8.8,
		herbLvl: 40,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy avantoe'),
		level: 50,
		plantXp: 0,
		checkXp: 54.5,
		harvestXp: 61.5,
		name: 'Avantoe',
		aliases: ['avantoe weed', 'avantoe'],
		inputItems: new Bank({ 'Avantoe seed': 1 }).freeze(),
		outputCrop: itemID('Grimy avantoe'),
		cleanHerbCrop: itemID('Avantoe'),
		herbXp: 10,
		herbLvl: 48,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy kwuarm'),
		level: 56,
		plantXp: 0,
		checkXp: 69,
		harvestXp: 78,
		name: 'Kwuarm',
		aliases: ['kwuarm weed', 'kwuarm'],
		inputItems: new Bank({ 'Kwuarm seed': 1 }).freeze(),
		outputCrop: itemID('Grimy kwuarm'),
		cleanHerbCrop: itemID('Kwuarm'),
		herbXp: 11.3,
		herbLvl: 54,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy snapdragon'),
		level: 62,
		plantXp: 0,
		checkXp: 87.5,
		harvestXp: 98.5,
		name: 'Snapdragon',
		aliases: ['snapdragon weed', 'snapdragon'],
		inputItems: new Bank({ 'Snapdragon seed': 1 }).freeze(),
		outputCrop: itemID('Grimy snapdragon'),
		cleanHerbCrop: itemID('Snapdragon'),
		herbXp: 11.8,
		herbLvl: 59,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy cadantine'),
		level: 67,
		plantXp: 0,
		checkXp: 106.5,
		harvestXp: 120,
		name: 'Cadantine',
		aliases: ['cadantine weed', 'cadantine'],
		inputItems: new Bank({ 'Cadantine seed': 1 }).freeze(),
		outputCrop: itemID('Grimy cadantine'),
		cleanHerbCrop: itemID('Cadantine'),
		herbXp: 12.5,
		herbLvl: 65,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy lantadyme'),
		level: 73,
		plantXp: 0,
		checkXp: 134.5,
		harvestXp: 151.5,
		name: 'Lantadyme',
		aliases: ['lantadyme weed', 'lantadyme'],
		inputItems: new Bank({ 'Lantadyme seed': 1 }).freeze(),
		outputCrop: itemID('Grimy lantadyme'),
		cleanHerbCrop: itemID('Lantadyme'),
		herbXp: 13.1,
		herbLvl: 67,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy dwarf weed'),
		level: 79,
		plantXp: 0,
		checkXp: 170.5,
		harvestXp: 192,
		name: 'Dwarf weed',
		aliases: ['dwarf weed', 'dwarf'],
		inputItems: new Bank({ 'Dwarf weed seed': 1 }).freeze(),
		outputCrop: itemID('Grimy dwarf weed'),
		cleanHerbCrop: itemID('Dwarf weed'),
		herbXp: 13.8,
		herbLvl: 70,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Grimy torstol'),
		level: 85,
		plantXp: 0,
		checkXp: 199.5,
		harvestXp: 224.5,
		name: 'Torstol',
		aliases: ['torstol weed', 'torstol'],
		inputItems: new Bank({ 'Torstol seed': 1 }).freeze(),
		outputCrop: itemID('Grimy torstol'),
		cleanHerbCrop: itemID('Torstol'),
		herbXp: 15,
		herbLvl: 75,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	}
];

export default herbPlants;
