import { Emoji } from '../../../constants';
import getOSItem from '../../../util/getOSItem';
import itemID from '../../../util/itemID';
import resolveItems from '../../../util/resolveItems';
import { Plant, SkillsEnum } from '../../types';
import allotmentPlants from './allotments';
import { bushes } from './bushes';
import fruitTrees from './fruitTrees';
import herbPlants from './herbPlants';
import hopsPlants from './hops';
import specialPlants from './specialPlants';
import trees from './trees';

export const plants: Plant[] = [
	...herbPlants,
	...trees,
	...allotmentPlants,
	...fruitTrees,
	...hopsPlants,
	...specialPlants,
	...bushes
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
		name: 'compost',
		item: getOSItem('Compost')
	},
	{
		name: 'supercompost',
		item: getOSItem('Supercompost')
	},
	{
		name: 'ultracompost',
		item: getOSItem('Ultracompost')
	}
] as const;
export type CompostName = typeof CompostTiers[number]['name'];

for (const plant of plants) {
	if (plant.outputCrop) allFarmingItems.push(plant.outputCrop);
	for (const key of Object.keys(plant.inputItems)) {
		allFarmingItems.push(Number(key));
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
		'Shiny mango'
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
