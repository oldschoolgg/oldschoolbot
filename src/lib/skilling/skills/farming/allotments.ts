import { Bank } from 'oldschooljs';

import itemID from '../../../util/itemID';
import type { Plant } from '../../types';

const allotmentPlants: Plant[] = [
	{
		id: itemID('Potato'),
		level: 1,
		plantXp: 8,
		checkXp: 0,
		harvestXp: 9,
		inputItems: new Bank({ 'Potato seed': 3 }).freeze(),
		outputCrop: itemID('Potato'),
		name: 'Potato',
		aliases: ['potato'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: new Bank({ Compost: 2 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 8,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 2] // Farming Guild Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		id: itemID('Onion'),
		level: 5,
		plantXp: 9.5,
		checkXp: 0,
		harvestXp: 10.5,
		inputItems: new Bank({ 'Onion seed': 3 }).freeze(),
		outputCrop: itemID('Onion'),
		name: 'Onion',
		aliases: ['onion'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: new Bank({ 'Potatoes(10)': 1 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 8,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 2] // Farming Guild Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		id: itemID('Cabbage'),
		level: 7,
		plantXp: 10,
		checkXp: 0,
		harvestXp: 10.5,
		inputItems: new Bank({ 'Cabbage seed': 3 }).freeze(),
		outputCrop: itemID('Cabbage'),
		name: 'Cabbage',
		aliases: ['cabbage'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: new Bank({ 'Onions(10)': 1 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 8,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 2] // Farming Guild Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		id: itemID('Tomato'),
		level: 12,
		plantXp: 12.5,
		checkXp: 0,
		harvestXp: 14,
		inputItems: new Bank({ 'Tomato seed': 3 }).freeze(),
		outputCrop: itemID('Tomato'),
		name: 'Tomato',
		aliases: ['tomato'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: new Bank({ 'Cabbages(10)': 2 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 8,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 2] // Farming Guild Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		id: itemID('Sweetcorn'),
		level: 20,
		plantXp: 17,
		checkXp: 0,
		harvestXp: 19,
		inputItems: new Bank({ 'Sweetcorn seed': 3 }).freeze(),
		outputCrop: itemID('Sweetcorn'),
		name: 'Sweetcorn',
		aliases: ['sweetcorn'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 60,
		numOfStages: 6,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: new Bank({ 'Jute fibre': 10 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 8,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 2] // Farming Guild Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		id: itemID('Strawberry'),
		level: 31,
		plantXp: 26,
		checkXp: 0,
		harvestXp: 29,
		inputItems: new Bank({ 'Strawberry seed': 3 }).freeze(),
		outputCrop: itemID('Strawberry'),
		name: 'Strawberry',
		aliases: ['strawberry'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 60,
		numOfStages: 6,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: new Bank({ 'Apples(5)': 1 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 8,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 2] // Farming Guild Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		id: itemID('Watermelon'),
		level: 47,
		plantXp: 48.5,
		checkXp: 0,
		harvestXp: 54.5,
		inputItems: new Bank({ 'Watermelon seed': 3 }).freeze(),
		outputCrop: itemID('Watermelon'),
		name: 'Watermelon',
		aliases: ['watermelon'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 80,
		numOfStages: 8,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: new Bank({ 'Curry leaf': 10 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 8,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 2] // Farming Guild Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	},
	{
		id: itemID('Snape grass'),
		level: 61,
		plantXp: 82,
		checkXp: 0,
		harvestXp: 82,
		inputItems: new Bank({ 'Snape grass seed': 3 }).freeze(),
		outputCrop: itemID('Snape grass'),
		name: 'Snape grass',
		aliases: ['snape grass'],
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 70,
		numOfStages: 7,
		chance1: 154,
		chance99: 193.56,
		chanceOfDeath: 25,
		protectionPayment: new Bank({ Jangerberries: 5 }).freeze(),
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 8,
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
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[45, 2] // Farming Guild Low (2)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 20
	}
];

export default allotmentPlants;
