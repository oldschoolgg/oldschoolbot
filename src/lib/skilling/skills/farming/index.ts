import { Emoji } from '@oldschoolgg/toolkit/constants';
import { CropUpgradeType } from '@prisma/client';
import { Items, itemID, resolveItems } from 'oldschooljs';

import allotmentPlants from '@/lib/skilling/skills/farming/allotments.js';
import { bushes } from '@/lib/skilling/skills/farming/bushes.js';
import fruitTrees from '@/lib/skilling/skills/farming/fruitTrees.js';
import herbPlants from '@/lib/skilling/skills/farming/herbPlants.js';
import hopsPlants from '@/lib/skilling/skills/farming/hops.js';
import specialPlants from '@/lib/skilling/skills/farming/specialPlants.js';
import trees from '@/lib/skilling/skills/farming/trees.js';
import { zygomitePlants } from '@/lib/skilling/skills/farming/zygomites.js';
import type { Plant } from '@/lib/skilling/types.js';

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

const Farming = {
	aliases: ['farming'],
	Plants: plants,
	id: 'farming',
	emoji: Emoji.Farming,
	name: 'Farming',
	maleFarmerItems,
	femaleFarmerItems
};

export default Farming;
