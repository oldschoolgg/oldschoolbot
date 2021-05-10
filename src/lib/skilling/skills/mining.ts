import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import { Ore, SkillsEnum } from '../types';

const GemRockTable = new LootTable()
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
		respawnTime: 0.5
	},
	{
		level: 1,
		xp: 17.5,
		id: 436,
		name: 'Copper ore',
		respawnTime: 0.5,
		petChance: 750_000,
		clueScrollChance: 741_600
	},
	{
		level: 1,
		xp: 17.5,
		id: 438,
		name: 'Tin ore',
		respawnTime: 0.5,
		petChance: 750_000,
		clueScrollChance: 741_600
	},
	{
		level: 1,
		xp: 0,
		id: 13421,
		name: 'Saltpetre',
		respawnTime: 1
	},
	{
		level: 15,
		xp: 35,
		id: 440,
		name: 'Iron ore',
		respawnTime: -0.2,
		petChance: 750_000,
		minerals: 100,
		clueScrollChance: 741_600
	},
	{
		level: 20,
		xp: 40,
		id: 442,
		name: 'Silver ore',
		respawnTime: 3,
		petChance: 750_000,
		clueScrollChance: 741_600
	},
	{
		level: 22,
		xp: 10,
		id: 21622,
		name: 'Volcanic ash',
		respawnTime: 0.05,
		petChance: 741_600
	},
	{
		level: 30,
		xp: 5,
		id: 7936,
		name: 'Pure essence',
		respawnTime: 0.5
	},
	{
		level: 30,
		xp: 50,
		id: 453,
		name: 'Coal',
		respawnTime: 2,
		petChance: 300_000,
		minerals: 60,
		clueScrollChance: 296_640
	},
	{
		level: 40,
		xp: 65,
		id: 444,
		name: 'Gold ore',
		respawnTime: 4,
		petChance: 300_000,
		nuggets: 204,  //based on 204/trip @ 99 with 30 minute trip
		clueScrollChance: 296_640
	},
	{
		level: 40,
		xp: 65,
		id: 1625,
		name: 'Gem rock',
		respawnTime: 6,
		petChance: 211_886,
		clueScrollChance: 211_886
	},
	{
		level: 55,
		xp: 80,
		id: 447,
		name: 'Mithril ore',
		respawnTime: 10,
		petChance: 150_000,
		nuggets: 107, //If you want N/hr at 99, for example, do Math.floor(10 * ore.nuggets / N);
		clueScrollChance: 148_320
	},
	{
		level: 70,
		xp: 95,
		id: 449,
		name: 'Adamantite ore',
		respawnTime: 18,
		petChance: 60_000,
		nuggets: 66,
		clueScrollChance: 59_328
	},
	{
		level: 85,
		xp: 125,
		id: 451,
		name: 'Runite ore',
		respawnTime: 50,
		petChance: 45_000,
		nuggets: 26,
		clueScrollChance: 42_377
	},
	{
		level: 92,
		xp: 240,
		id: 21347,
		name: 'Amethyst',
		respawnTime: 40,
		petChance: 50_000,
		minerals: 20,
		clueScrollChance: 46_350
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
