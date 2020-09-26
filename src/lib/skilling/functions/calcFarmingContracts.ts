import { KlasaUser } from 'klasa';
import { rand } from 'oldschooljs/dist/util/util';

import { SkillsEnum } from '../types';

const easyPlants = [
	// [farmingLevelNeeded, plantToGrow, plantTier]
	[45, 'Potato', 1],
	[45, 'Onion', 1],
	[45, 'Cabbage', 1],
	[45, 'Tomato', 1],
	[45, 'Sweetcorn', 1],
	[45, 'Limpwurt', 1],
	[48, 'Jangerberry', 2],
	[55, 'Cactus', 3],
	[65, 'Guam', 2],
	[65, 'Marrentill', 2],
	[65, 'Oak tree', 3],
	[65, 'Tarromin', 2],
	[65, 'Harralander', 2],
	[65, 'Willow tree', 3],
	[65, 'Ranarr', 2],
	[65, 'Toadflax', 2],
	[65, 'Irit', 2],
	[65, 'Maple tree', 3],
	[65, 'Avantoe', 2],
	[85, 'Apple tree', 3],
	[85, 'Banana tree', 3],
	[85, 'Orange tree', 3],
	[85, 'Curry tree', 3]
];

const mediumPlants = [
	// [farmingLevelNeeded, plantToGrow, plantTier]
	[65, 'Strawberry', 2],
	[65, 'Irit', 3],
	[65, 'Maple tree', 4],
	[65, 'Watermelon', 3],
	[65, 'Jangerberry', 3],
	[65, 'Avantoe', 3],
	[65, 'Cactus', 4],
	[65, 'Kwuarm', 3],
	[65, 'Whiteberry', 3],
	[65, 'Yew tree', 4],
	[65, 'Snape grass', 2],
	[65, 'Snapdragon', 3],
	[65, 'Potato cactus', 2],
	[67, 'Cadantine', 3],
	[70, 'Poison ivy', 3],
	[73, 'Lantadyme', 3],
	[75, 'Magic tree', 4],
	[85, 'Curry tree', 4],
	[85, 'Pineapple tree', 4],
	[85, 'Papaya tree', 4],
	[85, 'Palm tree', 4]
];

const hardPlants = [
	// [farmingLevelNeeded, plantToGrow, plantTier]
	[85, 'Maple tree', 5],
	[85, 'Watermelon', 4],
	[85, 'Whiteberry', 3],
	[85, 'Yew tree', 5],
	[85, 'Snape grass', 3],
	[85, 'Snapdragon', 4],
	[85, 'Potato cactus', 3],
	[85, 'Cadantine', 4],
	[85, 'Palm tree', 5],
	[85, 'Poison ivy', 4],
	[85, 'Lantadyme', 4],
	[85, 'Magic tree', 5],
	[85, 'Dwarf weed', 4],
	[85, 'Dragonfruit tree', 5],
	[85, 'Celastrus tree', 5],
	[85, 'Torstol', 4],
	[90, 'Redwood tree', 5]
];

export function getPlantToGrow(user: KlasaUser, contractLevel: 'easy' | 'medium' | 'hard') {
	const farmingLevel = user.skillLevel(SkillsEnum.Farming);
	let contractType: (string | number)[][] = [];
	if (contractLevel === 'easy') contractType = easyPlants;
	if (contractLevel === 'medium') contractType = mediumPlants;
	if (contractLevel === 'hard') contractType = hardPlants;

	for (let i = contractType.length; i > 0; i--) {
		const [farmingLevelNeeded] = contractType[i - 1];
		const index = contractType[i - 1];
		if (farmingLevel < farmingLevelNeeded) contractType.splice(contractType.indexOf(index), 1);
	}

	const plantFromContract = contractType[rand(0, contractType.length - 1)];
	const plantToGrow = plantFromContract[1];
	const tier = plantFromContract[2];

	return [plantToGrow, tier];
}
