import { User } from '@prisma/client';
import { randInt, roll } from 'e';
import { KlasaUser } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { getSkillsOfMahojiUser } from '../../../mahoji/mahojiSettings';
import { PlantTier } from '../../minions/farming/types';
import { stringMatches } from '../../util/cleanString';
import { SkillsEnum } from '../types';

const LowSeedPackTable = new LootTable()
	.add('Potato seed', [8, 12], 2)
	.add('Onion seed', [8, 12], 2)
	.add('Cabbage seed', [8, 12], 2)
	.add('Tomato seed', [8, 12], 2)
	.add('Sweetcorn seed', [8, 12], 2)
	.add('Strawberry seed', [8, 12], 2)
	.add('Barley seed', [8, 14], 2)
	.add('Hammerstone seed', [6, 8], 2)
	.add('Asgarnian seed', [6, 8], 2)
	.add('Jute seed', [8, 12], 2)
	.add('Yanillian seed', [6, 8], 2)
	.add('Krandorian seed', [6, 8], 2)
	.add('Acorn', [3, 5], 2)
	.add('Apple tree seed', [3, 5], 2)
	.add('Banana tree seed', [3, 5], 2)
	.add('Orange tree seed', [3, 5], 2)
	.add('Curry tree seed', [3, 5], 2)
	.add('Redberry seed', [6, 8], 2)
	.add('Cadavaberry seed', [6, 8], 2)
	.add('Dwellberry seed', [6, 8], 2)
	.add('Jangerberry seed', [6, 8], 2)
	.add('Marigold seed', [8, 12], 2)
	.add('Rosemary seed', [8, 12], 2)
	.add('Nasturtium seed', [8, 12], 2)
	.add('Woad seed', [8, 12], 2)
	.add('Guam seed', [3, 5], 2)
	.add('Marrentill seed', [3, 5], 2)
	.add('Tarromin seed', [3, 5], 2)
	.add('Harralander seed', [3, 5], 2)
	.add('Mushroom spore', [4, 6], 1)
	.add('Belladonna seed', [4, 6], 1);

const MediumSeedPackTable = new LootTable()
	.add('Irit seed', [2, 6], 3)
	.add('Limpwurt seed', [4, 8], 3)
	.add('Watermelon seed', [8, 12], 2)
	.add('Snape grass seed', [6, 8], 2)
	.add('Wildblood seed', [8, 12], 2)
	.add('Whiteberry seed', [6, 8], 2)
	.add('Poison ivy seed', [6, 8], 2)
	.add('Cactus seed', [2, 6], 2)
	.add('Potato cactus seed', [2, 6], 2)
	.add('Willow seed', [2, 4], 1)
	.add('Pineapple seed', [3, 5], 1)
	.add('Toadflax seed', [1, 3], 1)
	.add('Avantoe seed', [1, 3], 1)
	.add('Kwuarm seed', [1, 3], 1)
	.add('Cadantine seed', [1, 3], 1)
	.add('Lantadyme seed', [1, 3], 1)
	.add('Dwarf weed seed', [1, 3], 1)
	.add('Calquat tree seed', [3, 6], 1)
	.add('Teak seed', [1, 3], 1);

const HighSeedPackTable = new LootTable()
	.add('Papaya tree seed', [1, 3], 5)
	.add('Palm tree seed', [1, 2], 5)
	.add('Hespori seed', 1, 5)
	.add('Ranarr seed', [1, 2], 4)
	.add('Snapdragon seed', 1, 4)
	.add('Maple seed', [1, 2], 4)
	.add('Mahogany seed', [1, 2], 4)
	.add('Yew seed', 1, 3)
	.add('Dragonfruit tree seed', 1, 3)
	.add('Celastrus seed', 1, 2)
	.add('Torstol seed', 1, 2)
	.add('Magic seed', 1, 1)
	.add('Spirit seed', 1, 1)
	.add('Redwood tree seed', 1, 1);

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

export type PlantsList = [number, string, number][];

const easyPlants: PlantsList = [
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
	[90, 'Redwood tree', 5],
	[99, 'Athelas', 5],
	[99, 'Avocado bush', 5],
	[105, 'Mango bush', 5],
	[111, 'Lychee bush', 5],
	[120, 'Mysterious tree', 5]
];

export function getPlantToGrow(
	user: KlasaUser | User,
	{ contractLevel, ignorePlant }: { contractLevel: 'easy' | 'medium' | 'hard'; ignorePlant: string | null }
): [string, PlantTier] {
	const farmingLevel =
		user instanceof KlasaUser ? user.skillLevel(SkillsEnum.Farming) : getSkillsOfMahojiUser(user, true).farming;
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

	const plantFromContract = contractType[randInt(0, contractType.length - 1)];
	const plantToGrow = plantFromContract[1];
	const tier = plantFromContract[2];

	return [plantToGrow, tier as PlantTier];
}
