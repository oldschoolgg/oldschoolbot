import { SkillsEnum } from '../types';

const ores = [
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
		respawnTime: 0.5
	},
	{
		level: 1,
		xp: 17.5,
		id: 438,
		name: 'Tin ore',
		respawnTime: 0.5
	},
	{
		level: 15,
		xp: 35,
		id: 440,
		name: 'Iron ore',
		respawnTime: 0.5
	},
	{
		level: 20,
		xp: 40,
		id: 442,
		name: 'Silver ore',
		respawnTime: 3
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
		respawnTime: 2
	},
	{
		level: 40,
		xp: 65,
		id: 444,
		name: 'Gold ore',
		respawnTime: 2
	},
	{
		level: 55,
		xp: 80,
		id: 447,
		name: 'Mithril ore',
		respawnTime: 7
	},
	{
		level: 70,
		xp: 95,
		id: 449,
		name: 'Adamantite ore',
		respawnTime: 15
	},
	{
		level: 85,
		xp: 125,
		id: 451,
		name: 'Runite ore',
		respawnTime: 25
	},
	{
		level: 92,
		xp: 240,
		id: 21347,
		name: 'Amethyst',
		respawnTime: 25
	}
];

const Mining = {
	Ores: ores,
	id: SkillsEnum.Mining
};

export default Mining;
