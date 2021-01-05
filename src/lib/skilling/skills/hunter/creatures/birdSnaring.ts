import LootTable from 'oldschooljs/dist/structures/LootTable';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { Creature } from '../../../types';

const birdSnaringCreatures: Creature[] = [
	{
		name: `Crimson swift`,
		aliases: ['crimson swift'],
		level: 1,
		hunterXp: 34,
		itemsRequired: resolveNameBank({ 'Bird snare': 1 }),
		table: new LootTable().every('Bones').every('Raw bird meat').every('Red feather', [5, 10]),
		huntTechnique: 'bird snaring',
		multiTraps: true,
		catchTime: 20,
		slope: 1,
		intercept: 20
	},
	{
		name: `Golden warbler`,
		aliases: ['golden warbler'],
		level: 5,
		hunterXp: 47,
		itemsRequired: resolveNameBank({ 'Bird snare': 1 }),
		table: new LootTable()
			.every('Bones')
			.every('Raw bird meat')
			.every('Yellow feather', [5, 10]),
		huntTechnique: 'bird snaring',
		multiTraps: true,
		catchTime: 20,
		slope: 1,
		intercept: 15
	},
	{
		name: `Copper longtail`,
		aliases: ['copper longtail'],
		level: 9,
		hunterXp: 61.2,
		itemsRequired: resolveNameBank({ 'Bird snare': 1 }),
		table: new LootTable()
			.every('Bones')
			.every('Raw bird meat')
			.every('Orange feather', [5, 10]),
		huntTechnique: 'bird snaring',
		multiTraps: true,
		catchTime: 20,
		slope: 1.2,
		intercept: 12
	},
	{
		name: `Cerulean twitch`,
		aliases: ['cerulean twitch'],
		level: 11,
		hunterXp: 64.5,
		itemsRequired: resolveNameBank({ 'Bird snare': 1 }),
		table: new LootTable().every('Bones').every('Raw bird meat').every('Blue feather', [5, 10]),
		huntTechnique: 'bird snaring',
		multiTraps: true,
		catchTime: 20,
		slope: 1.3,
		intercept: 10
	},
	{
		name: `Tropical wagtail`,
		aliases: ['tropical wagtail'],
		level: 19,
		hunterXp: 95.2,
		itemsRequired: resolveNameBank({ 'Bird snare': 1 }),
		table: new LootTable()
			.every('Bones')
			.every('Raw bird meat')
			.every('Stripy feather', [5, 10]),
		huntTechnique: 'bird snaring',
		multiTraps: true,
		catchTime: 20,
		slope: 1.4,
		intercept: 5
	}
];

export default birdSnaringCreatures;
