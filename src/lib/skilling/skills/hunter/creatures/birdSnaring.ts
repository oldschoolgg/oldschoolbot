import { LootTable } from 'oldschooljs';

import type { Creature } from '../../../types';
import { HunterTechniqueEnum } from '../../../types';

const birdSnaringCreatures: Creature[] = [
	{
		name: 'Crimson swift',
		id: 1,
		aliases: ['crimson swift'],
		level: 1,
		hunterXP: 34,
		table: new LootTable().every('Bones').every('Raw bird meat').every('Red feather', [5, 10]),
		huntTechnique: HunterTechniqueEnum.BirdSnaring,
		multiTraps: true,
		catchTime: 10,
		slope: 1,
		intercept: 20
	},
	{
		name: 'Golden warbler',
		id: 2,
		aliases: ['golden warbler'],
		level: 5,
		hunterXP: 47,
		table: new LootTable().every('Bones').every('Raw bird meat').every('Yellow feather', [5, 10]),
		huntTechnique: HunterTechniqueEnum.BirdSnaring,
		multiTraps: true,
		catchTime: 11,
		slope: 0.95,
		intercept: 15
	},
	{
		name: 'Copper longtail',
		id: 3,
		aliases: ['copper longtail'],
		level: 9,
		hunterXP: 61.2,
		table: new LootTable().every('Bones').every('Raw bird meat').every('Orange feather', [5, 10]),
		huntTechnique: HunterTechniqueEnum.BirdSnaring,
		multiTraps: true,
		catchTime: 12,
		slope: 0.9,
		intercept: 12
	},
	{
		name: 'Cerulean twitch',
		id: 4,
		aliases: ['cerulean twitch'],
		level: 11,
		hunterXP: 64.5,
		table: new LootTable().every('Bones').every('Raw bird meat').every('Blue feather', [5, 10]),
		huntTechnique: HunterTechniqueEnum.BirdSnaring,
		multiTraps: true,
		catchTime: 15,
		slope: 0.85,
		intercept: 10
	},
	{
		name: 'Tropical wagtail',
		id: 5,
		aliases: ['tropical wagtail'],
		level: 19,
		hunterXP: 95.2,
		table: new LootTable().every('Bones').every('Raw bird meat').every('Stripy feather', [5, 10]),
		huntTechnique: HunterTechniqueEnum.BirdSnaring,
		multiTraps: true,
		catchTime: 17,
		slope: 0.85,
		intercept: 5
	}
];

export default birdSnaringCreatures;
