import { Emoji } from '@oldschoolgg/toolkit/constants';
import { CropUpgradeType } from '@prisma/client';
import { itemID, resolveItems } from 'oldschooljs';

import type { Plant } from '@/lib/skilling/types.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import getOSItem from '@/lib/util/getOSItem.js';
import allotmentPlants from './allotments.js';
import { bushes } from './bushes.js';
import fruitTrees from './fruitTrees.js';
import herbPlants from './herbPlants.js';
import hopsPlants from './hops.js';
import specialPlants from './specialPlants.js';
import trees from './trees.js';
import { zygomitePlants } from './zygomites.js';

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
		item: getOSItem('Compost')
	},
	{
		name: CropUpgradeType.supercompost,
		item: getOSItem('Supercompost')
	},
	{
		name: CropUpgradeType.ultracompost,
		item: getOSItem('Ultracompost')
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

const Farming = {
	aliases: ['farming'],
	Plants: plants,
	id: SkillsEnum.Farming,
	emoji: Emoji.Farming,
	name: 'Farming',
	maleFarmerItems,
	femaleFarmerItems
};

export default Farming;
