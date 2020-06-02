import { Plant } from '../../types';
import itemID from '../../../util/itemID';

const specialPlants: Plant[] = [
	{
		level: 23,
		plantXp: 19,
		checkXp: 0,
		harvestXp: 21,
		inputItems: itemID(`Seaweed spore`),
		outputCrop: itemID('Giant seaweed'),
		name: `Seaweed`,
		petChance: 7_500,
		seedType: 'seaweed',
		growthTime: 40,
		numOfStages: 4,
		chance1: 149,
		chance99: 208,
		chanceOfDeath: 17/128, //needs data
		protectionPayment: {[itemID("Numulite")]: 200}
	},
	{
		level: 35,
		plantXp: 35,
		checkXp: 7_290,
		harvestXp: 0,
		inputItems: itemID(`Teak seed`),
		outputLogs: itemID('Teak logs'),
		treeWoodcuttingLevel: 35,
		name: `Teak`,
		petChance: 5_000,
		seedType: 'hardwood',
		growthTime: 3_840,
		numOfStages: 8,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17/128, //needs data
		protectionPayment: {[itemID("Limpwurt root")]: 15}
	},
	{
		level: 36,
		plantXp: 31.5,
		checkXp: 625,
		harvestXp: 40,
		inputItems: itemID(`Grape seed`),
		outputCrop: itemID('Grapes'),
		name: `Grape`,
		petChance: 385_426,
		seedType: 'vine',
		growthTime: 35,
		numOfStages: 7,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 17/128, //needs data
		protectionPayment: 0
	},
	{
		level: 55,
		plantXp: 66.5,
		checkXp: 374,
		harvestXp: 25,
		inputItems: itemID(`Cactus seed`),
		outputCrop: itemID('Cactus spine'),
		name: `Cactus`,
		petChance: 7_000,
		seedType: 'cactus',
		growthTime: 560,
		numOfStages: 7,
		chance1: 62,
		chance99: 177,
		chanceOfDeath: 17/128, //needs data
		protectionPayment: {[itemID("Cadava berries")]: 6}
	},
	{
		level: 55,
		plantXp: 63,
		checkXp: 15_720,
		harvestXp: 0,
		inputItems: itemID(`Mahogany seed`),
		outputLogs: itemID('Mahogany logs'),
		treeWoodcuttingLevel: 50,
		name: `Mahogany`,
		petChance: 5_000,
		seedType: 'hardwood',
		growthTime: 5_120,
		numOfStages: 8,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17/128, //needs data
		protectionPayment: {[itemID("Yanillian hops")]: 25}
	},
	{
		level: 59,
		plantXp: 78,
		checkXp: 437.5,
		harvestXp: 29,
		inputItems: itemID(`Whiteberry seed`),
		outputCrop: itemID('White berries'),
		name: `Whiteberry`,
		petChance: 28_104,
		seedType: 'bush',
		growthTime: 160,
		numOfStages: 8,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 17/128, //needs data
		protectionPayment: {[itemID("Mushroom")]: 8}
	},
	{
		level: 64,
		plantXp: 68,
		checkXp: 230,
		harvestXp: 68,
		inputItems: itemID(`Potato cactus seed`),
		outputCrop: itemID('Potato cactus'),
		name: `Potato cactus`,
		petChance: 160_594,
		seedType: 'cactus',
		growthTime: 70,
		numOfStages: 7,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 17/128, //needs data
		protectionPayment: {[itemID("Snape grass")]: 8}
	},
	{
		level: 70,
		plantXp: 120,
		checkXp: 675,
		harvestXp: 45,
		inputItems: itemID(`Poison ivy seed`),
		outputCrop: itemID('Poison ivy berries'),
		name: `Poison ivy`,
		petChance: 28_104,
		seedType: 'bush',
		growthTime: 160,
		numOfStages: 8,
		chance1: 0, //needs data
		chance99: 0, //needs data
		chanceOfDeath: 0, // not possible
		protectionPayment: 0
	},
	{
		level: 72,
		plantXp: 129.5,
		checkXp: 12_096,
		harvestXp: 48.5,
		inputItems: itemID(`Calquat tree seed`),
		outputCrop: itemID('Calquat fruit'),
		name: `Calquat`,
		petChance: 6_000,
		seedType: 'calquat',
		growthTime: 1_280,
		numOfStages: 8,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17/128, //needs data
		protectionPayment: {[itemID("Poison ivy berries")]: 8}
	},
	{
		level: 74,
		plantXp: 126,
		checkXp: 13_240,
		harvestXp: 0,
		inputItems: itemID(`Crystal acorn`),
		outputCrop: itemID('Crystal shard'),
		name: `Crystal`,
		petChance: 9_000,
		seedType: 'crystal',
		growthTime: 480,
		numOfStages: 6,
		chance1: 0, // needs data, possibly not needed
		chance99: 0, // needs data, possibly not needed
		chanceOfDeath: 0, //not possible
		protectionPayment: 0
	},
	{
		level: 83,
		plantXp: 199.5,
		checkXp: 19_301,
		harvestXp: 0,
		inputItems: itemID(`Spirit seed`),
		name: `Spirit`,
		petChance: 5_000,
		seedType: 'spirit',
		growthTime: 3_840,
		numOfStages: 12,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17/128,  //needs data
		protectionPayment: 0 //this takes like 3 items that is cba to code in
	},
	{
		level: 85,
		plantXp: 204,
		checkXp: 14_130,
		harvestXp: 23.5,
		inputItems: itemID(`Celastrus seed`),
		outputCrop: itemID('Celastrus bark'),
		name: `Celastrus`,
		petChance: 9_000,
		seedType: 'celastrus',
		growthTime: 800,
		numOfStages: 5,
		chance1: 0, // needs data
		chance99: 0, // needs data
		chanceOfDeath: 17/128,  //needs data
		protectionPayment: {[itemID("Potato cactus")]: 8}
	},
	{
		level: 90,
		plantXp: 230,
		checkXp: 22_450,
		harvestXp: 0,
		inputItems: itemID(`Redwood tree seed`),
		outputLogs: itemID('Redwood logs'),
		treeWoodcuttingLevel: 90,
		name: `Redwood`,
		petChance: 5_000,
		seedType: 'redwood',
		growthTime: 6_400,
		numOfStages: 10,
		chance1: 0, // not needed
		chance99: 0, // not needed
		chanceOfDeath: 17/128,  //needs data
		protectionPayment: {[itemID("Dragonfruit")]: 6}
	},
]

export default specialPlants;
