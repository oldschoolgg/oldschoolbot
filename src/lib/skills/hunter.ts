import { SkillsEnum, Creature } from '../types';
import { Emoji } from '../constants';

const creatures: Creature[] = [
	{
		level: 1,
		xp: 34,
		id: 5549,
		name: 'Crimson swift',
		respawnTime: 3,
		drops: ['Bones', 'Raw bird meat', 'Red feather']
	},
	{
		level: 9,
		xp: 61,
		id: 5552,
		name: 'Copper longtail',
		respawnTime: 3,
		drops: ['Bones', 'Raw bird meat', 'Orange feather']
	},
	{
		level: 11,
		xp: 64.5,
		id: 5550,
		name: 'Cerulean twitch',
		respawnTime: 3,
		drops: ['Bones', 'Raw bird meat', 'Blue feather']
	},
	{
		level: 19,
		xp: 95.2,
		id: 5548,
		name: 'Tropical wagtail',
		respawnTime: 3,
		drops: ['Bones', 'Raw bird meat', 'Stripy feather']
	},
	{
		level: 27,
		xp: 115.2,
		id: 1505,
		name: 'Ferret',
		respawnTime: 3,
		drops: ['Ferret']
	},
	{
		level: 37,
		xp: 204,
		id: 1346,
		name: 'Prickly kebbit',
		respawnTime: 4,
		drops: ['Bones', 'Kebbit spike']
	},
	{
		level: 47,
		xp: 224,
		id: 2903,
		name: 'Orange salamander',
		respawnTime: 4,
		drops: ['Orange salamander']
	},
	{
		level: 63,
		xp: 265,
		id: 2910,
		name: 'Red chinchompa',
		respawnTime: 5,
		drops: ['Red chinchompa'],
		petChance: 98_373
	},
	{
		level: 73,
		xp: 315,
		id: 2912,
		name: 'Black chinchompa',
		respawnTime: 5,
		drops: ['Black chinchompa'],
		petChance: 82_758
	}
];

const Hunter = {
	Creatures: creatures,
	id: SkillsEnum.Hunter,
	emoji: Emoji.Hunter
};

export default Hunter;
