import { LootTable } from 'oldschooljs';

import type { Creature } from '../../../types';
import { HunterTechniqueEnum } from '../../../types';

const boxTrappingCreatures: Creature[] = [
	{
		name: 'Ferret',
		id: 6,
		aliases: ['ferret'],
		level: 27,
		hunterXP: 115.2,
		table: new LootTable().every('Ferret'),
		huntTechnique: HunterTechniqueEnum.BoxTrapping,
		multiTraps: true,
		catchTime: 22,
		qpRequired: 2,
		slope: 1,
		intercept: 15
	},
	{
		name: 'Chinchompa',
		id: 7,
		aliases: ['chinchompa', 'chin', 'chins'],
		level: 53,
		hunterXP: 198.4,
		table: new LootTable().every('Chinchompa'),
		huntTechnique: HunterTechniqueEnum.BoxTrapping,
		multiTraps: true,
		catchTime: 30,
		qpRequired: 2,
		slope: 1.034_79,
		intercept: 1.694_95
	},
	{
		name: 'Carnivorous chinchompa',
		id: 8,
		aliases: ['carnivorous chinchompa', 'red chinchompa', 'red chin', 'red chins'],
		level: 63,
		hunterXP: 265,
		table: new LootTable().every('Red chinchompa'),
		huntTechnique: HunterTechniqueEnum.BoxTrapping,
		multiTraps: true,
		catchTime: 28,
		qpRequired: 2,
		slope: 1.22,
		intercept: -31.33
	},
	{
		name: 'Black chinchompa',
		id: 9,
		aliases: ['black chinchompa', 'black chin', 'black chins'],
		level: 73,
		hunterXP: 315,
		table: new LootTable().every('Black chinchompa'),
		huntTechnique: HunterTechniqueEnum.BoxTrapping,
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
