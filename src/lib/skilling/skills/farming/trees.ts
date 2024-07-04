import { Bank } from 'oldschooljs';

import itemID from '../../../util/itemID';
import type { Plant } from '../../types';

const trees: Plant[] = [
	{
		id: itemID('Oak logs'),
		level: 15,
		plantXp: 14,
		checkXp: 467.3,
		harvestXp: 0,
		name: 'Oak tree',
		aliases: ['oak tree', 'oak'],
		inputItems: new Bank({ Acorn: 1 }).freeze(),
		outputLogs: itemID('Oak logs'),
		outputRoots: itemID('Oak roots'),
		treeWoodcuttingLevel: 15,
		petChance: 22_483,
		seedType: 'tree',
		growthTime: 200,
		numOfStages: 5,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 16 / 128,
		protectionPayment: new Bank({ 'Tomatoes(5)': 1 }).freeze(),
		woodcuttingXp: 37.5,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 5,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Willow logs'),
		level: 30,
		plantXp: 25,
		checkXp: 1456.5,
		harvestXp: 0,
		name: 'Willow tree',
		aliases: ['willow tree', 'willow'],
		inputItems: new Bank({ 'Willow seed': 1 }).freeze(),
		outputLogs: itemID('Willow logs'),
		outputRoots: itemID('Willow roots'),
		treeWoodcuttingLevel: 30,
		petChance: 16_059,
		seedType: 'tree',
		growthTime: 280,
		numOfStages: 7,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 14 / 128,
		protectionPayment: new Bank({ 'Apples(5)': 1 }).freeze(),
		woodcuttingXp: 67.5,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 5,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Maple logs'),
		level: 45,
		plantXp: 45,
		checkXp: 3403.4,
		harvestXp: 0,
		name: 'Maple tree',
		aliases: ['maple tree', 'maple'],
		inputItems: new Bank({ 'Maple seed': 1 }).freeze(),
		outputLogs: itemID('Maple logs'),
		outputRoots: itemID('Maple roots'),
		treeWoodcuttingLevel: 45,
		petChance: 14_052,
		seedType: 'tree',
		growthTime: 320,
		numOfStages: 8,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 12 / 128,
		protectionPayment: new Bank({ 'Oranges(5)': 1 }).freeze(),
		woodcuttingXp: 100,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 5,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Yew logs'),
		level: 60,
		plantXp: 81,
		checkXp: 7069.9,
		harvestXp: 0,
		name: 'Yew tree',
		aliases: ['yew tree', 'yew'],
		inputItems: new Bank({ 'Yew seed': 1 }).freeze(),
		outputLogs: itemID('Yew logs'),
		outputRoots: itemID('Yew roots'),
		treeWoodcuttingLevel: 60,
		petChance: 11_242,
		seedType: 'tree',
		growthTime: 400,
		numOfStages: 10,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 10 / 128,
		protectionPayment: new Bank({ 'Cactus spine': 10 }).freeze(),
		woodcuttingXp: 175,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 5,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		id: itemID('Magic logs'),
		level: 75,
		plantXp: 145.4,
		checkXp: 13_768.3,
		harvestXp: 0,
		name: 'Magic tree',
		aliases: ['magic tree', 'magic'],
		inputItems: new Bank({ 'Magic seed': 1 }).freeze(),
		outputLogs: itemID('Magic logs'),
		outputRoots: itemID('Magic roots'),
		treeWoodcuttingLevel: 75,
		petChance: 9368,
		seedType: 'tree',
		growthTime: 480,
		numOfStages: 12,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 8 / 128,
		protectionPayment: new Bank({ Coconut: 25 }).freeze(),
		woodcuttingXp: 250,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 5,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [],
		additionalPatchesByFarmGuildAndLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	}
];

export default trees;
