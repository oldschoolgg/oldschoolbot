import { resolveNameBank } from '../../../util';
import itemID from '../../../util/itemID';
import { Plant } from '../../types';

const flowerPlants: Plant[] = [
	{
		level: 26,
		plantXp: 21.5,
		checkXp: 0,
		harvestXp: 120,
		inputItems: resolveNameBank({ 'Limpwurt seed': 1 }),
		outputCrop: itemID('Limpwurt root'),
		variableYield: true,
		name: 'Limpwurt',
		aliases: ['limpwurt', 'limp'],
		petChance: 224_832,
		seedType: 'flower',
		growthTime: 20,
		numOfStages: 4,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 25,
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
			[1, 1], // Canifs Patch
			[33, 1] // Prif Patch
		],
		// [Farm Lvl, Patches Gained]
		additionalPatchesByFarmLvl: [
			[45, 1] // Farming Guild
		],
		timePerPatchTravel: 20,
		timePerHarvest: 5
	}
];

export default flowerPlants;
