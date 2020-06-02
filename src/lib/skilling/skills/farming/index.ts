import { Plant, SkillsEnum } from '../../types';
import { Emoji } from '../../../constants';
import itemID from '../../../util/itemID';
import herbPlants from './herbPlants';
import trees from './trees';
import fruitTrees from './fruitTrees';
import specialPlants from './specialPlants';

const plants: Plant[] = [...herbPlants, ...trees, ...fruitTrees, ...specialPlants];

const farmerItems: { [key: number]: number } = {
	[itemID(`Farmer's strawhat`)]: 0.4,
	[itemID(`Farmer's jacket`)]: 0.8,
	[itemID(`Farmer's boro trousers`)]: 0.6,
	[itemID(`Farmer's boots`)]: 0.2
};

const Farming = {
	aliases: ['farming'],
	Plants: plants,
	id: SkillsEnum.Farming,
	emoji: Emoji.Farming,
	farmerItems,
	name: 'farming'
};

export default Farming;
