import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Creature } from '../../../types';

const trackingCreatures: Creature[] = [
	{
		name: `Polar kebbit`,
		id: 31,
		aliases: ['polar kebbit'],
		level: 1,
		hunterXp: 30,
		table: new LootTable().every('Bones').every('Polar kebbit fur').every('Raw beast meat'),
		huntTechnique: 'tracking',
		catchTime: 30,
		slope: 0,
		intercept: 99
	},
	{
		name: `Common kebbit`,
		id: 32,
		aliases: ['common kebbit'],
		level: 3,
		hunterXp: 36,
		table: new LootTable().every('Bones').every('Common kebbit fur').every('Raw beast meat'),
		huntTechnique: 'tracking',
		catchTime: 34,
		slope: 0,
		intercept: 99
	},
	{
		name: `Feldip weasel`,
		id: 33,
		aliases: ['feldip weasel', 'feldips'],
		level: 7,
		hunterXp: 48,
		table: new LootTable().every('Bones').every('Feldip weasel fur').every('Raw beast meat'),
		huntTechnique: 'tracking',
		catchTime: 38,
		slope: 0,
		intercept: 99
	},
	{
		name: `Desert devil`,
		id: 34,
		aliases: ['desert devil'],
		level: 13,
		hunterXp: 66,
		table: new LootTable().every('Bones').every('Desert devil fur').every('Raw beast meat'),
		huntTechnique: 'tracking',
		catchTime: 32,
		slope: 0,
		intercept: 99
	},
	{
		name: `Razor-backed kebbit`,
		id: 35,
		aliases: ['razor-backed kebbit', 'razor kebbit'],
		level: 49,
		hunterXp: 348.5,
		table: new LootTable().every('Bones').every('Long kebbit spike').every('Raw beast meat'),
		huntTechnique: 'tracking',
		catchTime: 47,
		slope: 0,
		intercept: 99
	},
	{
		name: `Herbiboar`,
		id: 36,
		aliases: ['herbiboar', 'herbi'],
		level: 80,
		hunterXp: 1950, // Scaleable xp depending on hunting lvl
		table: new LootTable().tertiary(6500, 'Herbi') /* Scaleable loot table */,
		huntTechnique: 'tracking',
		catchTime: 91,
		slope: 0,
		intercept: 99
	}
];

export default trackingCreatures;
