import { stringMatches } from '@oldschoolgg/toolkit/util';
import { randArrItem, randInt, roll } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { HighSeedPackTable, LowSeedPackTable, MediumSeedPackTable } from '../../data/seedPackTables';
import type { PlantTier } from '../../minions/farming/types';

export function openSeedPack(seedTier: number): Bank {
	const loot = new Bank();

	const tempTable = new LootTable();

	// Roll amount variables
	let high = 0;
	let medium = 0;
	let low = 0;

	switch (seedTier) {
		case 0:
		case 1: {
			high = 0;
			medium = randInt(1, 3);
			low = 6 - medium;
			break;
		}
		case 2: {
			if (roll(11)) {
				high = 1;
			}
			medium = randInt(2, 3);
			low = 7 - medium - high;
			break;
		}
		case 3: {
			high = randInt(0, 1);
			medium = randInt(2, 4);
			low = 8 - medium - high;
			break;
		}
		case 4: {
			high = randInt(1, 2);
			medium = randInt(3, 5);
			low = 9 - medium - high;
			break;
		}
		case 5: {
			high = randInt(1, 3);
			medium = randInt(4, 6);
			low = 10 - medium - high;
			break;
		}
	}

	// Low seed roll
	tempTable.every(LowSeedPackTable, low);
	// Medium seed roll
	tempTable.every(MediumSeedPackTable, medium);
	// High seed roll
	tempTable.every(HighSeedPackTable, high);

	loot.add(tempTable.roll());

	return loot;
}

type PlantsList = [number, string, number][];

const easyPlants: PlantsList = [
	// [farmingLevelNeeded, plantToGrow, plantTier]
	[45, 'Potato', 1],
	[45, 'Marigold', 1],
	[45, 'Onion', 1],
	[45, 'Cabbage', 1],
	[45, 'Redberry', 2],
	[45, 'Cadavaberry', 2],
	[45, 'Rosemary', 1],
	[45, 'Tomato', 1],
	[45, 'Sweetcorn', 1],
	[45, 'Nasturtium', 1],
	[45, 'Woad leaf', 1],
	[45, 'Limpwurt', 1],
	[45, 'Dwellberry', 2],
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

const mediumPlants: PlantsList = [
	// [farmingLevelNeeded, plantToGrow, plantTier]
	[65, 'Strawberry', 2],
	[65, 'Irit', 3],
	[65, 'Maple tree', 4],
	[65, 'Watermelon', 3],
	[65, 'Jangerberry', 3],
	[65, 'Avantoe', 3],
	[65, 'Cactus', 4],
	[65, 'Kwuarm', 3],
	[65, 'White lily', 2],
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

const hardPlants: PlantsList = [
	// [farmingLevelNeeded, plantToGrow, plantTier]
	[85, 'Maple tree', 5],
	[85, 'Watermelon', 4],
	[85, 'White lily', 2],
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

export function getPlantToGrow(
	user: MUser,
	{ contractLevel, ignorePlant }: { contractLevel: 'easy' | 'medium' | 'hard'; ignorePlant: string | null }
): [string, PlantTier] {
	const farmingLevel = user.skillsAsLevels.farming;
	let contractType: PlantsList = [];
	if (contractLevel === 'easy') contractType = [...easyPlants];
	if (contractLevel === 'medium') contractType = [...mediumPlants];
	if (contractLevel === 'hard') contractType = [...hardPlants];

	for (let i = contractType.length; i > 0; i--) {
		const [farmingLevelNeeded, plantName] = contractType[i - 1];
		const index = contractType[i - 1];
		if (farmingLevel < farmingLevelNeeded || stringMatches(ignorePlant ?? '', plantName))
			contractType.splice(contractType.indexOf(index), 1);
	}

	const plantFromContract = randArrItem(contractType);
	const plantToGrow = plantFromContract[1];
	const tier = plantFromContract[2];

	return [plantToGrow, tier as PlantTier];
}
