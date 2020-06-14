import { Plant } from '../../types';
import itemID from '../../../util/itemID';

const allotmentPlants: Plant[] = [
	{
		level: 1,
		plantXp: 8,
		checkXp: 0,
		harvestXp: 9,
		inputItems: { [itemID(`Potato seed`)]: 3},
		outputCrop: itemID('Potato'),
		name: `Potato`,
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 0, //needs data
		protectionPayment: { [itemID('Compost')]: 2 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
	},
	{
		level: 5,
		plantXp: 9.5,
		checkXp: 0,
		harvestXp: 10.5,
		inputItems: { [itemID(`Onion seed`)]: 3 },
		outputCrop: itemID('Onion'),
		name: `Onion`,
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 0, //needs data
		protectionPayment: { [itemID('Potatoes(10)')]: 1 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
	},
	{
		level: 7,
		plantXp: 10,
		checkXp: 0,
		harvestXp: 10.5,
		inputItems: { [itemID(`Cabbage seed`)]: 3 },
		outputCrop: itemID('Cabbage'),
		name: `Cabbage`,
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 0, //needs data
		protectionPayment: { [itemID('Onions(10)')]: 1 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
	},
	{
		level: 12,
		plantXp: 12.5,
		checkXp: 0,
		harvestXp: 14,
		inputItems: { [itemID(`Tomato seed`)]: 3 },
		outputCrop: itemID('Tomato'),
		name: `Tomato`,
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 40,
		numOfStages: 4,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 0, //needs data
		protectionPayment: { [itemID('Cabbages(10)')]: 2 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
	},
	{
		level: 20,
		plantXp: 17,
		checkXp: 0,
		harvestXp: 19,
		inputItems: { [itemID(`Sweetcorn seed`)]: 3 },
		outputCrop: itemID('Sweetcorn'),
		name: `Sweetcorn`,
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 60,
		numOfStages: 6,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 0, //needs data
		protectionPayment: { [itemID('Jute fibre')]: 10 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
	},
	{
		level: 31,
		plantXp: 26,
		checkXp: 0,
		harvestXp: 29,
		inputItems: { [itemID(`Strawberry seed`)]: 3 },
		outputCrop: itemID('Strawberry'),
		name: `Strawberry`,
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 60,
		numOfStages: 6,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 0, //needs data
		protectionPayment: { [itemID('Apples(5)')]: 1 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
	},
	{
		level: 47,
		plantXp: 48.5,
		checkXp: 0,
		harvestXp: 54.5,
		inputItems: { [itemID(`Watermelon seed`)]: 3 },
		outputCrop: itemID('Watermelon'),
		name: `Watermelon`,
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 80,
		numOfStages: 8,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 0, //needs data
		protectionPayment: { [itemID('Curry leaf')]: 10 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
	},
	{
		level: 61,
		plantXp: 82,
		checkXp: 0,
		harvestXp: 82,
		inputItems: { [itemID(`Snape grass seed`)]: 3 },
		outputCrop: itemID('Snape grass'),
		name: `Snape grass`,
		petChance: 173_977,
		seedType: 'allotment',
		growthTime: 70,
		numOfStages: 7,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 0, //needs data
		protectionPayment: { [itemID('Jangerberries')]: 5 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
	}
];

export default allotmentPlants;
