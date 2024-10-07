import { CropUpgradeType } from '@prisma/client';

import { Emoji } from '../../../constants';
import getOSItem from '../../../util/getOSItem';
import itemID from '../../../util/itemID';
import resolveItems from '../../../util/resolveItems';
import { type Plant, SkillsEnum } from '../../types';
import allotmentPlants from './allotments';
import { bushes } from './bushes';
import fruitTrees from './fruitTrees';
import herbPlants from './herbPlants';
import hopsPlants from './hops';
import specialPlants from './specialPlants';
import trees from './trees';
import { zygomitePlants } from './zygomites';

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
