import { SkillsEnum, Ore } from '../types';
import { Emoji } from '../constants';

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
		petChance: 750_000
	},
	{
		level: 1,
		xp: 17.5,
		id: 438,
		name: 'Tin ore',
		respawnTime: 0.5,
		petChance: 750_000
	},
	{
		level: 15,
		xp: 48,
		id: 440,
		name: 'Iron ore',
		respawnTime: 0.2,
		petChance: 750_000
	},
	{
		level: 20,
		xp: 40,
		id: 442,
		name: 'Silver ore',
		respawnTime: 3,
		petChance: 750_000
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
		minerals: 60
	},
	{
		level: 40,
		xp: 65,
		id: 444,
		name: 'Gold ore',
		respawnTime: 2,
		petChance: 300_000,
		nuggets: true
	},
	{
		level: 55,
		xp: 80,
		id: 447,
		name: 'Mithril ore',
		respawnTime: 10,
		petChance: 150_000,
		nuggets: true
	},
	{
		level: 70,
		xp: 95,
		id: 449,
		name: 'Adamantite ore',
		respawnTime: 18,
		petChance: 60_000,
		nuggets: true
	},
	{
		level: 85,
		xp: 125,
		id: 451,
		name: 'Runite ore',
		respawnTime: 50,
		petChance: 45_000,
		nuggets: true
	},
	{
		level: 92,
		xp: 240,
		id: 21347,
		name: 'Amethyst',
		respawnTime: 40,
		petChance: 50_000,
		minerals: 20
	}
];

const Mining = {
	Ores: ores,
	id: SkillsEnum.Mining,
	emoji: Emoji.Mining
};

export default Mining;
