import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Creature } from '../../../types';

const boxTrappingCreatures: Creature[] = [
	{
		name: `Ferret`,
		id: 6,
		aliases: ['ferret'],
		level: 27,
		hunterXp: 115.2,
		table: new LootTable().every('Ferret'),
		huntTechnique: 'box trapping',
		multiTraps: true,
		catchTime: 22,
		qpRequired: 2,
		slope: 1,
		intercept: 15
	},
	{
		name: `Chinchompa`,
		id: 7,
		aliases: ['chinchompa', 'chin', 'chins'],
		level: 53,
		hunterXp: 198.4,
		table: new LootTable().every('Chinchompa'),
		huntTechnique: 'box trapping',
		multiTraps: true,
		catchTime: 30,
		qpRequired: 2,
		slope: 1.03479,
		intercept: 1.69495
	},
	{
		name: `Carnivorous chinchompa`,
		id: 8,
		aliases: ['carnivorous chinchompa', 'red chinchompa', 'red chin', 'red chins'],
		level: 63,
		hunterXp: 265,
		table: new LootTable().every('Red chinchompa'),
		huntTechnique: 'box trapping',
		multiTraps: true,
		catchTime: 28,
		qpRequired: 2,
		slope: 1.22,
		intercept: -31.33
	},
	{
		name: `Black chinchompa`,
		id: 9,
		aliases: ['black chinchompa', 'black chin', 'black chins'],
		level: 73,
		hunterXp: 315,
		table: new LootTable().every('Black chinchompa'),
		huntTechnique: 'box trapping',
		multiTraps: true,
		wildy: true,
		prayerLvl: 43,
		catchTime: 28,
		qpRequired: 2,
		slope: 1.22,
		intercept: -31.33
	}
];

export default boxTrappingCreatures;
