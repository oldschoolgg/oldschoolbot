import { LootTable } from 'oldschooljs';

import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import type { Ore } from '../types';
import { SkillsEnum } from '../types';

const GemRockTable = new LootTable()
	.add('Uncut opal', 1, 60)
	.add('Uncut jade', 1, 30)
	.add('Uncut red topaz', 1, 15)
	.add('Uncut sapphire', 1, 9)
	.add('Uncut emerald', 1, 5)
	.add('Uncut ruby', 1, 5)
	.add('Uncut diamond', 1, 4);

const GraniteRockTable = new LootTable().add('Granite (500g)').add('Granite (2kg)').add('Granite (5kg)');

const SandstoneRockTable = new LootTable()
	.add('Sandstone (1kg)')
	.add('Sandstone (2kg)')
	.add('Sandstone (5kg)')
	.add('Sandstone (10kg)');

const ores: Ore[] = [
	{
		level: 1,
		xp: 5,
		id: 434,
		name: 'Clay',
		respawnTime: 3,
		bankingTime: 80,
		slope: 1.06,
		intercept: 49.33,
		petChance: 741_600,
		clueScrollChance: 741_600
	},
	{
		level: 1,
		xp: 5,
		id: 1436,
		name: 'Rune essence',
		respawnTime: 2.75,
		bankingTime: 33,
		slope: 0,
		intercept: 100
	},
	{
		level: 1,
		xp: 17.5,
		id: 436,
		name: 'Copper ore',
		respawnTime: 3,
		bankingTime: 80,
		slope: 1.06,
		intercept: 49.33,
		petChance: 741_600,
		clueScrollChance: 741_600,
		aliases: ['copper']
	},
	{
		level: 1,
		xp: 17.5,
		id: 438,
		name: 'Tin ore',
		respawnTime: 3,
		bankingTime: 80,
		slope: 1.06,
		intercept: 49.33,
		petChance: 741_600,
		clueScrollChance: 741_600,
		aliases: ['tin']
	},
	{
		level: 1,
		xp: 0,
		id: 13_421,
		name: 'Saltpetre',
		respawnTime: 3,
		bankingTime: 16,
		slope: 1.06,
		intercept: 49.33
	},
	{
		level: 15,
		xp: 35,
		id: 440,
		name: 'Iron ore',
		respawnTime: 3,
		bankingTime: 33,
		slope: 0.94,
		intercept: 42.5,
		petChance: 741_600,
		minerals: 100,
		clueScrollChance: 741_600,
		aliases: ['iron']
	},
	{
		level: 20,
		xp: 40,
		id: 442,
		name: 'Silver ore',
		respawnTime: 7,
		bankingTime: 33,
		slope: 0.7,
		intercept: 9,
		petChance: 741_600,
		clueScrollChance: 741_600,
		aliases: ['silver']
	},
	{
		level: 22,
		xp: 10,
		id: 21_622,
		name: 'Volcanic ash',
		respawnTime: 4.5,
		bankingTime: 0,
		slope: 1.06,
		intercept: 49.33,
		petChance: 741_600,
		aliases: ['ash', 'volcanic']
	},
	{
		level: 30,
		xp: 5,
		id: 7936,
		name: 'Pure essence',
		respawnTime: 2.75,
		bankingTime: 33,
		slope: 0,
		intercept: 100,
		aliases: ['pess', 'pure', 'essence', 'ess']
	},
	{
		level: 30,
		xp: 50,
		id: 453,
		name: 'Coal',
		respawnTime: 6,
		bankingTime: 33,
		slope: 0.34,
		intercept: 5.83,
		petChance: 296_640,
		minerals: 60,
		clueScrollChance: 296_640
	},
	{
		level: 35,
		xp: 45,
		id: 6975,
		name: 'Sandstone',
		respawnTime: 3,
		bankingTime: 10,
		slope: 0.8,
		intercept: 10.01,
		petChance: 741_600,
		clueScrollChance: 741_600,
		aliases: ['sand']
	},
	{
		level: 40,
		xp: 65,
		id: 1625,
		name: 'Gem rock',
		respawnTime: 3,
		bankingTime: 16,
		slope: 0.18,
		intercept: 10.04,
		petChance: 211_886,
		clueScrollChance: 211_886,
		aliases: ['gems', 'gem', 'gem rocks']
	},
	{
		level: 40,
		xp: 65,
		id: 444,
		name: 'Gold ore',
		respawnTime: 7,
		bankingTime: 33,
		slope: 0.28,
		intercept: 2.15,
		petChance: 296_640,
		clueScrollChance: 296_640,
		aliases: ['gold']
	},
	{
		level: 45,
		xp: 60,
		id: 6983,
		name: 'Granite',
		respawnTime: 3,
		bankingTime: 80,
		slope: 0.84,
		intercept: 10.93,
		petChance: 741_600,
		clueScrollChance: 741_600
	},
	{
		level: 55,
		xp: 80,
		id: 447,
		name: 'Mithril ore',
		respawnTime: 11,
		bankingTime: 33,
		slope: 0.2,
		intercept: 0.59,
		petChance: 148_320,
		clueScrollChance: 148_320,
		aliases: ['mith', 'mith ore', 'mithril']
	},
	{
		level: 60,
		xp: 5,
		id: 24_706,
		name: 'Daeyalt essence rock',
		respawnTime: 3,
		bankingTime: 0,
		slope: 0,
		intercept: 100,
		aliases: ['dae', 'daey', 'daeyalt', 'daeyalt essence']
	},
	{
		level: 70,
		xp: 95,
		id: 449,
		name: 'Adamantite ore',
		respawnTime: 18,
		bankingTime: 33,
		slope: 0.11,
		intercept: -0.53,
		petChance: 59_328,
		clueScrollChance: 59_328,
		aliases: ['addy', 'adamant', 'adamant ore', 'adamantite']
	},
	{
		level: 85,
		xp: 125,
		id: 451,
		name: 'Runite ore',
		respawnTime: 50,
		bankingTime: 40,
		slope: 0.08,
		intercept: -0.85,
		petChance: 42_377,
		clueScrollChance: 42_377,
		aliases: ['rune', 'rune ore', 'runite']
	},
	{
		level: 92,
		xp: 240,
		id: 21_347,
		name: 'Amethyst',
		respawnTime: 2.75,
		bankingTime: 33,
		slope: 0.05,
		intercept: -1.35,
		petChance: 46_350,
		minerals: 20,
		clueScrollChance: 46_350,
		aliases: ['amy', 'ame']
	}
];

// Uses determineMiningTime function, therefore Ore object and id -1
const MotherlodeMine: Ore = {
	level: 30,
	xp: 60,
	id: -1,
	name: 'Motherlode mine',
	aliases: ['mlm', 'ml', 'motherlode'],
	respawnTime: 5.5,
	bankingTime: 60,
	slope: 0.181,
	intercept: 23.48,
	petChance: 247_200
};

// Uses determineMiningTime function, therefore Ore object and id -1
const CamdozaalMine: Ore = {
	level: 14,
	xp: 16,
	id: -1,
	name: 'Barronite rocks',
	respawnTime: 3,
	bankingTime: 20,
	slope: 0.082_71,
	intercept: 30.872,
	petChance: 741_600,
	clueScrollChance: 741_600
};

const prospectorItems: { [key: number]: number } = {
	[itemID('Prospector helmet')]: 0.4,
	[itemID('Prospector jacket')]: 0.8,
	[itemID('Prospector legs')]: 0.6,
	[itemID('Prospector boots')]: 0.2
};

export const prospectorItemsArr = Object.entries(prospectorItems).map(([itemID, bonus]) => ({
	id: Number.parseInt(itemID),
	boostPercent: bonus
}));

const Mining = {
	aliases: ['mining'],
	Ores: ores,
	MotherlodeMine,
	CamdozaalMine,
	GemRockTable,
	GraniteRockTable,
	SandstoneRockTable,
	id: SkillsEnum.Mining,
	emoji: Emoji.Mining,
	prospectorItems,
	name: 'Mining'
};

export default Mining;
