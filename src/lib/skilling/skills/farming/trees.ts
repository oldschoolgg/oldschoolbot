import { Plant } from '../../types';
import itemID from '../../../util/itemID';

const trees: Plant[] = [
	{
		level: 15,
		plantXp: 14,
		checkXp: 467.3,
		harvestXp: 0,
		name: `Oak`,
		inputItems: { [itemID(`Acorn`)]: 1},
		outputLogs: itemID('Oak logs'),
		treeWoodcuttingLevel: 15,
		petChance: 22_483,
		seedType: 'tree',
		growthTime: 200,
		numOfStages: 5,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 16 / 128, // estimate, needs data
		protectionPayment: { [itemID('Tomatoes(5)')]: 1 },
		woodcuttingXp: 37.5,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
	},
	{
		level: 30,
		plantXp: 25,
		checkXp: 1_456.5,
		harvestXp: 0,
		name: `Willow`,
		inputItems: { [itemID(`Willow seed`)]: 1},
		outputLogs: itemID('Willow logs'),
		treeWoodcuttingLevel: 30,
		petChance: 16_059,
		seedType: 'tree',
		growthTime: 280,
		numOfStages: 7,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 14 / 128, //estimate, needs data
		protectionPayment: { [itemID('Apples(5)')]: 1 },
		woodcuttingXp: 67.5,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
	},
	{
		level: 45,
		plantXp: 45,
		checkXp: 3_403.4,
		harvestXp: 0,
		name: `Maple`,
		inputItems: { [itemID(`Maple seed`)]: 1},
		outputLogs: itemID('Maple logs'),
		treeWoodcuttingLevel: 45,
		petChance: 14_052,
		seedType: 'tree',
		growthTime: 320,
		numOfStages: 8,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 12 / 128,
		protectionPayment: { [itemID('Oranges(5)')]: 1 },
		woodcuttingXp: 100,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
	},
	{
		level: 60,
		plantXp: 81,
		checkXp: 7_069.9,
		harvestXp: 0,
		name: `Yew`,
		inputItems: { [itemID(`Yew seed`)]: 1},
		outputLogs: itemID('Yew logs'),
		treeWoodcuttingLevel: 60,
		petChance: 11_242,
		seedType: 'tree',
		growthTime: 400,
		numOfStages: 10,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 10 / 128, //estimate, needs data
		protectionPayment: { [itemID('Cactus spine')]: 10 },
		woodcuttingXp: 175,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
	},
	{
		level: 75,
		plantXp: 145.4,
		checkXp: 13_768.3,
		harvestXp: 0,
		name: `Magic`,
		inputItems: { [itemID(`Magic seed`)]: 1},
		outputLogs: itemID('Magic logs'),
		treeWoodcuttingLevel: 75,
		petChance: 9_368,
		seedType: 'tree',
		growthTime: 480,
		numOfStages: 12,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 8 / 128,
		protectionPayment: { [itemID('Coconut')]: 25 },
		woodcuttingXp: 250,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
	}
];

export default trees;
