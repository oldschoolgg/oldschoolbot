import { Emoji } from '../../../constants';
import itemID from '../../../util/itemID';
import { Plant, SkillsEnum } from '../../types';
import allotmentPlants from './allotments';
import fruitTrees from './fruitTrees';
import herbPlants from './herbPlants';
import specialPlants from './specialPlants';
import hopsPlants from './hops';
import trees from './trees';

const plants: Plant[] = [
	...herbPlants,
	...trees,
	...allotmentPlants,
	...fruitTrees,
	...hopsPlants,
	...specialPlants
];

const maleFarmerItems: { [key: number]: number } = {
	[itemID(`Farmer's strawhat`)]: 0.4,
	[itemID(`Farmer's jacket`)]: 0.8,
	[itemID(`Farmer's boro trousers`)]: 0.6,
	[itemID(`Farmer's boots`)]: 0.2
};

const femaleFarmerItems: { [key: number]: number } = {
	[itemID(`Farmer's strawhat`)]: 0.4,
	[itemID(`Farmer's shirt`)]: 0.8,
	[itemID(`Farmer's boro trousers`)]: 0.6,
	[itemID(`Farmer's boots`)]: 0.2
};

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
