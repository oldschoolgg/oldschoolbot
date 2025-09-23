import { Emoji } from '@oldschoolgg/toolkit/constants';
import { CropUpgradeType } from '@prisma/client';
import { Items, itemID } from 'oldschooljs';

import type { Plant } from '@/lib/skilling/types.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import allotmentPlants from './allotments.js';
import fruitTrees from './fruitTrees.js';
import herbPlants from './herbPlants.js';
import hopsPlants from './hops.js';
import specialPlants from './specialPlants.js';
import trees from './trees.js';

export const plants: Plant[] = [
	...herbPlants,
	...trees,
	...allotmentPlants,
	...fruitTrees,
	...hopsPlants,
	...specialPlants
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
	if (plant.outputCrop) allFarmingItems.push(plant.outputCrop);
	for (const [item] of plant.inputItems.items()) {
		allFarmingItems.push(item.id);
	}
	if (plant.outputLogs) allFarmingItems.push(plant.outputLogs);
	if (plant.outputRoots) allFarmingItems.push(plant.outputRoots);
}
allFarmingItems.push(itemID('Tangleroot'));

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
