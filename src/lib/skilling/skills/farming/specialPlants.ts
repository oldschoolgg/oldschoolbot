import { Plant } from '../../types';
import itemID from '../../../util/itemID';

const specialPlants: Plant[] = [
	{
		level: 23,
		plantXp: 19,
		checkXp: 0,
		harvestXp: 21,
		inputItems: { [itemID(`Seaweed spore`)]: 1 },
		outputCrop: itemID('Giant seaweed'),
		name: `Seaweed`,
		aliases: ['Seadweed'],
		petChance: 7_500,
		seedType: 'seaweed',
		growthTime: 40,
		numOfStages: 4,
		chance1: 149,
		chance99: 208,
		chanceOfDeath: 20,
		protectionPayment: { [itemID('Numulite')]: 200 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 2] // Underwater Fossil Island (2)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: []
	},
	{
		level: 35,
		plantXp: 35,
		checkXp: 7_290,
		harvestXp: 0,
		inputItems: { [itemID(`Teak seed`)]: 1 },
		outputLogs: itemID('Teak logs'),
		treeWoodcuttingLevel: 35,
		name: `Teak tree`,
		aliases: ['Teak tree', 'teak', 'teaks'],
		petChance: 5_000,
		seedType: 'hardwood',
		growthTime: 3_840,
		numOfStages: 8,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 15,
		protectionPayment: { [itemID('Limpwurt root')]: 15 },
		woodcuttingXp: 85,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 3] // Fossil Island (3)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: []
	},
	{
		level: 36,
		plantXp: 31.5,
		checkXp: 625,
		harvestXp: 40,
		inputItems: { [itemID(`Grape seed`)]: 1, [itemID('Saltpetre')]: 1 },
		outputCrop: itemID('Grapes'),
		name: `Grape`,
		aliases: ['Grape', 'Grapes'],
		petChance: 385_426,
		seedType: 'vine',
		growthTime: 35,
		numOfStages: 7,
		chance1: 139.8,
		chance99: 206.36,
		chanceOfDeath: 0,
		protectionPayment: 0,
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 12,
		canPayFarmer: false,
		canCompostPatch: false,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: []
	},
	{
		level: 48,
		plantXp: 50.5,
		checkXp: 284.5,
		harvestXp: 19,
		inputItems: { [itemID(`Jangerberry seed`)]: 1 },
		outputCrop: itemID('Jangerberries'),
		name: `Jangerberry`,
		aliases: ['Jangerberry', 'Jangerberries'],
		petChance: 28_104,
		seedType: 'bush',
		growthTime: 160,
		numOfStages: 8,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 17, // needs data
		protectionPayment: { [itemID('Watermelon')]: 6 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 3,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 1] // Etceteria patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 1] // Farming Guild Low (1)
		]
	},
	{
		level: 55,
		plantXp: 66.5,
		checkXp: 374,
		harvestXp: 25,
		inputItems: { [itemID(`Cactus seed`)]: 1 },
		outputCrop: itemID('Cactus spine'),
		name: `Cactus`,
		aliases: ['Cactus'],
		petChance: 7_000,
		seedType: 'cactus',
		growthTime: 560,
		numOfStages: 7,
		chance1: -78.38,
		chance99: 178.2,
		chanceOfDeath: 15,
		protectionPayment: { [itemID('Cadava berries')]: 6 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 1,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 1] // Farming Guide Low (1)
		]
	},
	{
		level: 55,
		plantXp: 63,
		checkXp: 15_720,
		harvestXp: 0,
		inputItems: { [itemID(`Mahogany seed`)]: 1 },
		outputLogs: itemID('Mahogany logs'),
		treeWoodcuttingLevel: 50,
		name: `Mahogany tree`,
		aliases: ['Mahogany tree', 'Mahogany'],
		petChance: 5_000,
		seedType: 'hardwood',
		growthTime: 5_120,
		numOfStages: 8,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 12,
		protectionPayment: { [itemID('Yanillian hops')]: 25 },
		woodcuttingXp: 125,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 3] // Fossil Island (3)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: []
	},
	{
		level: 59,
		plantXp: 78,
		checkXp: 437.5,
		harvestXp: 29,
		inputItems: { [itemID(`Whiteberry seed`)]: 1 },
		outputCrop: itemID('White berries'),
		name: `Whiteberry`,
		aliases: ['Whiteberry', 'Whiteberries'],
		petChance: 28_104,
		seedType: 'bush',
		growthTime: 160,
		numOfStages: 8,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 15,
		protectionPayment: { [itemID('Mushroom')]: 8 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 3,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 1] // Etceteria patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 1] // Farming Guild Low (1)
		]
	},
	{
		level: 64,
		plantXp: 68,
		checkXp: 230,
		harvestXp: 68,
		inputItems: { [itemID(`Potato cactus seed`)]: 1 },
		outputCrop: itemID('Potato cactus'),
		name: `Potato cactus`,
		aliases: ['Potato cactus'],
		petChance: 160_594,
		seedType: 'cactus',
		growthTime: 70,
		numOfStages: 7,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 12,
		protectionPayment: { [itemID('Snape grass')]: 8 },
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 1] // Farming Guide Low (1)
		]
	},
	{
		level: 65,
		plantXp: 62,
		checkXp: 12600,
		harvestXp: 0,
		inputItems: { [itemID(`Hespori seed`)]: 1 },
		name: `Hespori`,
		aliases: ['Hespori'],
		petChance: 7_000,
		seedType: 'hespori',
		growthTime: 1920,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 0,
		protectionPayment: {},
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: false,
		defaultNumOfPatches: 1,
		canPayFarmer: false,
		canCompostPatch: false,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: []
	},
	{
		level: 70,
		plantXp: 120,
		checkXp: 675,
		harvestXp: 45,
		inputItems: { [itemID(`Poison ivy seed`)]: 1 },
		outputCrop: itemID('Poison ivy berries'),
		name: `Poison ivy`,
		aliases: ['Poison ivy'],
		petChance: 28_104,
		seedType: 'bush',
		growthTime: 160,
		numOfStages: 8,
		chance1: 88.6,
		chance99: 154.9,
		chanceOfDeath: 0,
		protectionPayment: 0,
		needsChopForHarvest: false,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 3,
		canPayFarmer: false,
		canCompostPatch: false,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[3, 1] // Etceteria patch (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 1] // Farming Guild Low (1)
		]
	},
	{
		level: 72,
		plantXp: 129.5,
		checkXp: 12_096,
		harvestXp: 48.5,
		inputItems: { [itemID(`Calquat tree seed`)]: 1 },
		outputCrop: itemID('Calquat fruit'),
		treeWoodcuttingLevel: 1,
		name: `Calquat tree`,
		aliases: ['Calquat tree', 'Calquat'],
		petChance: 6_000,
		seedType: 'calquat',
		growthTime: 1_280,
		numOfStages: 8,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 17,
		protectionPayment: { [itemID('Poison ivy berries')]: 8 },
		needsChopForHarvest: true,
		fixedOutput: true,
		fixedOutputAmount: 6,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 1,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: []
	},
	{
		level: 74,
		plantXp: 126,
		checkXp: 13_240,
		harvestXp: 0,
		inputItems: { [itemID(`Crystal acorn`)]: 1 },
		outputCrop: itemID('Crystal shard'),
		variableYield: true,
		variableOutputAmount: [
			['', 8, 10],
			['compost', 10, 12],
			['supercompost', 12, 14],
			['ultracompost', 14, 16]
		],
		treeWoodcuttingLevel: 1,
		name: `Crystal tree`,
		aliases: ['Crystal tree', 'Crystal'],
		petChance: 9_000,
		seedType: 'crystal',
		growthTime: 480,
		numOfStages: 6,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 0,
		protectionPayment: 0,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 0,
		canPayFarmer: false,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [
			[33, 1] // Prifddinas (1)
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: []
	},
	{
		level: 83,
		plantXp: 199.5,
		checkXp: 19_301,
		harvestXp: 0,
		inputItems: { [itemID(`Spirit seed`)]: 1 },
		treeWoodcuttingLevel: 1,
		name: `Spirit tree`,
		aliases: ['Spirit tree', 'Spirit'],
		petChance: 5_000,
		seedType: 'spirit',
		growthTime: 3_840,
		numOfStages: 12,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 8,
		protectionPayment: {
			[itemID('Monkey nuts')]: 5,
			[itemID('Monkey bar')]: 1,
			[itemID('Ground tooth')]: 1
		},
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: false,
		defaultNumOfPatches: 1,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[91, 1], // Plant up to 2 seeds at lvl 91
			[99, 4] // Plant in all patches at lvl 99
		]
	},
	{
		level: 85,
		plantXp: 204,
		checkXp: 14_130,
		harvestXp: 23.5,
		inputItems: { [itemID(`Celastrus seed`)]: 1 },
		outputCrop: itemID('Celastrus bark'),
		treeWoodcuttingLevel: 1,
		name: `Celastrus tree`,
		aliases: ['Celastrus tree', 'Celastrus'],
		petChance: 9_000,
		seedType: 'celastrus',
		growthTime: 800,
		numOfStages: 5,
		chance1: -26.6,
		chance99: 63,
		chanceOfDeath: 15,
		protectionPayment: { [itemID('Potato cactus')]: 8 },
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: false,
		givesCrops: true,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: true,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guild High (1)
		]
	},
	{
		level: 90,
		plantXp: 230,
		checkXp: 22_450,
		harvestXp: 0,
		inputItems: { [itemID(`Redwood tree seed`)]: 1 },
		outputLogs: itemID('Redwood logs'),
		treeWoodcuttingLevel: 90,
		name: `Redwood tree`,
		aliases: ['Redwood tree', 'Redwood'],
		petChance: 5_000,
		seedType: 'redwood',
		growthTime: 6_400,
		numOfStages: 11,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 8,
		protectionPayment: { [itemID('Dragonfruit')]: 6 },
		woodcuttingXp: 380,
		needsChopForHarvest: true,
		fixedOutput: false,
		givesLogs: true,
		givesCrops: false,
		defaultNumOfPatches: 0,
		canPayFarmer: true,
		canCompostPatch: true,
		canCompostandPay: false,
		// [QP, Patches Gained]
		additionalPatchesByQP: [],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[85, 1] // Farming Guild High (1)
		]
	}
];

export default specialPlants;
