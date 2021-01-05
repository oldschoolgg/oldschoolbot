import LootTable from 'oldschooljs/dist/structures/LootTable';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { Creature } from '../../../types';

const boxTrappingCreatures: Creature[] = [
	{
		name: `Ferret`,
		aliases: ['ferret'],
		level: 27,
		hunterXp: 115.2,
		itemsRequired: resolveNameBank({ 'Box trap': 1 }),
		table: new LootTable().every('Ferret'),
		huntTechnique: 'box trapping',
		multiTraps: true,
		catchTime: 10,
		qpRequired: 2,
		slope: 1,
		intercept: 15
	},
	{
		name: `Chinchompa`,
		aliases: ['chinchompa'],
		level: 53,
		hunterXp: 198.4,
		itemsRequired: resolveNameBank({ 'Box trap': 1 }),
		table: new LootTable().every('Chinchompa'),
		huntTechnique: 'box trapping',
		multiTraps: true,
		catchTime: 15,
		qpRequired: 2,
		slope: 1.03479,
		intercept: 1.69495
	},
	{
		name: `Carnivorous chinchompa`,
		aliases: ['carnivorous chinchompa'],
		level: 63,
		hunterXp: 265,
		itemsRequired: resolveNameBank({ 'Box trap': 1 }),
		table: new LootTable().every('Red chinchompa'),
		huntTechnique: 'box trapping',
		multiTraps: true,
		catchTime: 15,
		qpRequired: 2,
		slope: 1.22,
		intercept: -31.33
	},
	{
		name: `Black chinchompa`,
		aliases: ['black chinchompa'],
		level: 73,
		hunterXp: 315,
		itemsRequired: resolveNameBank({ 'Box trap': 1 }),
		table: new LootTable().every('Black chinchompa'),
		huntTechnique: 'box trapping',
		multiTraps: true,
		wildy: true,
		prayerLvl: 43,
		catchTime: 15,
		qpRequired: 2,
		slope: 1.22,
		intercept: -31.33
	}
];

export default boxTrappingCreatures;
