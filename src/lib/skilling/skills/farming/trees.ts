import { resolveNameBank } from '../../../util';
import itemID from '../../../util/itemID';
import { Plant } from '../../types';

const trees: Plant[] = [
	{
		level: 15,
		plantXp: 14,
		checkXp: 467.3,
		harvestXp: 0,
		name: 'Oak tree',
		aliases: ['oak tree', 'oak'],
		inputItems: resolveNameBank({ Acorn: 1 }),
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
		protectionPayment: resolveNameBank({ 'Tomatoes(5)': 1 }),
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
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 30,
		plantXp: 25,
		checkXp: 1456.5,
		harvestXp: 0,
		name: 'Willow tree',
		aliases: ['willow tree', 'willow'],
		inputItems: resolveNameBank({ 'Willow seed': 1 }),
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
		protectionPayment: resolveNameBank({ 'Apples(5)': 1 }),
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
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 45,
		plantXp: 45,
		checkXp: 3403.4,
		harvestXp: 0,
		name: 'Maple tree',
		aliases: ['maple tree', 'maple'],
		inputItems: resolveNameBank({ 'Maple seed': 1 }),
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
		protectionPayment: resolveNameBank({ 'Oranges(5)': 1 }),
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
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 60,
		plantXp: 81,
		checkXp: 7069.9,
		harvestXp: 0,
		name: 'Yew tree',
		aliases: ['yew tree', 'yew'],
		inputItems: resolveNameBank({ 'Yew seed': 1 }),
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
		protectionPayment: resolveNameBank({ 'Cactus spine': 10 }),
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
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	},
	{
		level: 75,
		plantXp: 145.4,
		checkXp: 13_768.3,
		harvestXp: 0,
		name: 'Magic tree',
		aliases: ['magic tree', 'magic'],
		inputItems: resolveNameBank({ 'Magic seed': 1 }),
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
		protectionPayment: resolveNameBank({ Coconut: 25 }),
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
		additionalPatchesByFarmLvl: [
			[65, 1] // Farming Guild Med (1)
		],
		timePerPatchTravel: 20,
		timePerHarvest: 10
	}
];

export default trees;
