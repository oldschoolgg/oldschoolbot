import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import { Ore, SkillsEnum } from '../types';

export const GemRockTable = new LootTable()
	.add('Uncut opal', 1, 60)
	.add('Uncut jade', 1, 30)
	.add('Uncut red topaz', 1, 15)
	.add('Uncut sapphire', 1, 9)
	.add('Uncut emerald', 1, 5)
	.add('Uncut ruby', 1, 5)
	.add('Uncut diamond', 1, 4);

const ores: Ore[] = [
	{
		level: 1,
		xp: 5,
		id: 1436,
		name: 'Rune essence',
		respawnTime: 0.5,
		loot: new LootTable().add('Rune essence', 1, 100)
	},
	{
		level: 1,
		xp: 17.5,
		id: 436,
		name: 'Copper ore',
		respawnTime: 0.5,
		petChance: 750_000,
		clueScrollChance: 741_600,
		loot: new LootTable().add('Copper ore', 1, 100)
	},
	{
		level: 1,
		xp: 17.5,
		id: 438,
		name: 'Tin ore',
		respawnTime: 0.5,
		petChance: 750_000,
		clueScrollChance: 741_600,
		loot: new LootTable().add('Tin ore', 1, 100)
	},
	{
		level: 1,
		xp: 0,
		id: 13_421,
		name: 'Saltpetre',
		respawnTime: 1,
		loot: new LootTable().add('Saltpetre', 1, 100)
	},
	{
		level: 15,
		xp: 35,
		id: 440,
		name: 'Iron ore',
		respawnTime: -0.2,
		petChance: 750_000,
		minerals: 100,
		clueScrollChance: 741_600,
		loot: new LootTable().add('Iron ore', 1, 100)
	},
	{
		level: 20,
		xp: 40,
		id: 442,
		name: 'Silver ore',
		respawnTime: 3,
		petChance: 750_000,
		clueScrollChance: 741_600,
		loot: new LootTable().add('Silver ore', 1, 100)
	},
	{
		level: 22,
		xp: 10,
		id: 21_622,
		name: 'Volcanic ash',
		respawnTime: 1.9,
		petChance: 741_600,
		loot: new LootTable().add('Volcanic ash', 1, 100)
	},
	{
		level: 30,
		xp: 5,
		id: 7936,
		name: 'Pure essence',
		respawnTime: 0.5,
		loot: new LootTable().add('Pure essence', 1, 100)
	},
	{
		level: 30,
		xp: 50,
		id: 453,
		name: 'Coal',
		respawnTime: 2,
		petChance: 300_000,
		minerals: 60,
		clueScrollChance: 296_640,
		loot: new LootTable().add('Coal', 1, 100)
	},
	{
		level: 40,
		xp: 65,
		id: 444,
		name: 'Gold ore',
		respawnTime: 4,
		petChance: 300_000,
		nuggets: true,
		clueScrollChance: 296_640,
		loot: new LootTable().add('Gold ore', 1, 100)
	},
	{
		level: 40,
		xp: 65,
		id: 1625,
		name: 'Gem rock',
		respawnTime: 6,
		petChance: 211_886,
		clueScrollChance: 211_886,
		loot: GemRockTable
	},
	{
		level: 55,
		xp: 80,
		id: 447,
		name: 'Mithril ore',
		respawnTime: 10,
		petChance: 150_000,
		nuggets: true,
		clueScrollChance: 148_320,
		loot: new LootTable().add('Mithril ore', 1, 100)
	},
	{
		level: 70,
		xp: 95,
		id: 449,
		name: 'Adamantite ore',
		respawnTime: 18,
		petChance: 60_000,
		nuggets: true,
		clueScrollChance: 59_328,
		loot: new LootTable().add('Adamantite ore', 1, 100)
	},
	{
		level: 85,
		xp: 125,
		id: 451,
		name: 'Runite ore',
		respawnTime: 50,
		petChance: 45_000,
		nuggets: true,
		clueScrollChance: 42_377,
		loot: new LootTable().add('Runite ore', 1, 100)
	},
	{
		level: 92,
		xp: 240,
		id: 21_347,
		name: 'Amethyst',
		respawnTime: 40,
		petChance: 50_000,
		minerals: 20,
		clueScrollChance: 46_350,
		loot: new LootTable().add('Amethyst', 1, 100)
	},
	{
		level: 120,
		xp: 3_000,
		id: 508,
		name: 'Mysterious ore',
		respawnTime: 90,
		petChance: 40_000,
		loot: new LootTable()
			// Common
			.add('Coal', [250, 750], 46)
			.add('Amethyst', [50, 150], 46)
			.add('Gold ore', [250, 750], 46)
			.add('Golden nugget', [1, 50], 46)
			.add('Pure essence', [1000, 5000], 46)
			.add('Runite ore', [20, 50], 46)
			// Uncommon - 1/50 (6/300)
			.add('Runite ore', [50, 120], 6)
			.add('Tradeable mystery box', 1, 6)
			.add('Clue scroll (master)', 2, 6)
			// Rare
			.add('Clue scroll (grandmaster)', 1, 2) // 1/150 (2/300)
			.add('Onyx', 1, 3) // 1/100 (3/300)
	}
];

const prospectorItems: { [key: number]: number } = {
	[itemID('Prospector helmet')]: 0.4,
	[itemID('Prospector jacket')]: 0.8,
	[itemID('Prospector legs')]: 0.6,
	[itemID('Prospector boots')]: 0.2
};

const Mining = {
	aliases: ['mining'],
	Ores: ores,
	GemRockTable,
	id: SkillsEnum.Mining,
	emoji: Emoji.Mining,
	prospectorItems,
	name: 'Mining'
};

export default Mining;
