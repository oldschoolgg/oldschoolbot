import { bushes } from '@/lib/bso/skills/farming/bushes.js';
import { zygomitePlants } from '@/lib/bso/skills/farming/zygomites.js';

import { Emoji } from '@oldschoolgg/toolkit';
import { CropUpgradeType } from '@prisma/client';
import { Items, itemID, resolveItems } from 'oldschooljs';

import { openSeedPack } from '@/lib/skilling/skills/farming/utils/calcFarmingContracts.js';
import { defineSkill, type Plant } from '@/lib/skilling/types.js';
import allotmentPlants from './allotments.js';
import fruitTrees from './fruitTrees.js';
import herbPlants from './herbPlants.js';
import hopsPlants from './hops.js';
import specialPlants from './specialPlants.js';
import trees from './trees.js';
import { calcNumOfPatches, calcVariableYield } from './utils/calcsFarming.js';
import { defaultFarmingContract, defaultPatches } from './utils/farmingConstants.js';
import {
	farmingPatchNames,
	findPlant,
	getFarmingKeyFromName,
	isPatchName,
	userGrowingProgressStr
} from './utils/farmingHelpers.js';
import { getFarmingInfoFromUser } from './utils/getFarmingInfo.js';
import * as PatchTypes from './utils/types.js';

export const plants: Plant[] = [
	...herbPlants,
	...trees,
	...allotmentPlants,
	...fruitTrees,
	...hopsPlants,
	...specialPlants,
	...bushes,
	...zygomitePlants
];

const maleFarmerItems: { [key: number]: number } = {
	[itemID("Farmer's strawhat")]: 0.4,
	[itemID("Farmer's jacket")]: 0.8,
	[itemID("Farmer's boro trousers")]: 0.6,
	[itemID("Farmer's boots")]: 0.2
};

const femaleFarmerItems: { [key: number]: number } = {
	[itemID("Farmer's strawhat")]: 0.4,
	[itemID("Farmer's shirt")]: 0.8,
	[itemID("Farmer's boro trousers")]: 0.6,
	[itemID("Farmer's boots")]: 0.2
};

export const allFarmingItems: number[] = [];

export const CompostTiers = [
	{
		name: CropUpgradeType.compost,
		item: Items.getOrThrow('Compost')
	},
	{
		name: CropUpgradeType.supercompost,
		item: Items.getOrThrow('Supercompost')
	},
	{
		name: CropUpgradeType.ultracompost,
		item: Items.getOrThrow('Ultracompost')
	}
] as const;

for (const plant of plants) {
	if (resolveItems(['Pumpkin']).includes(plant.id)) continue;
	if (plant.outputCrop) allFarmingItems.push(plant.outputCrop);
	for (const [item] of plant.inputItems.items()) {
		allFarmingItems.push(item.id);
	}
	if (plant.outputLogs) allFarmingItems.push(plant.outputLogs);
	if (plant.outputRoots) allFarmingItems.push(plant.outputRoots);
}

allFarmingItems.push(
	...resolveItems([
		'Master farmer hat',
		'Master farmer jacket',
		'Master farmer pants',
		'Master farmer gloves',
		'Master farmer boots',
		'Tangleroot',
		'Plopper',
		'Shiny mango',
		'Fungo'
	])
);

export { PatchTypes };

export const Farming = defineSkill({
	aliases: ['farming'],
	Plants: plants,
	id: 'farming',
	emoji: Emoji.Farming,
	name: 'Farming',
	maleFarmerItems,
	femaleFarmerItems,
	defaultFarmingContract,
	defaultPatches,
	calcNumOfPatches,
	calcVariableYield,
	userGrowingProgressStr,
	findPlant,
	getFarmingKeyFromName,
	openSeedPack,
	farmingPatchNames,
	getFarmingInfoFromUser,
	isPatchName
});
