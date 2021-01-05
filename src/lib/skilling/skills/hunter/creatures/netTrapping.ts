import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Creature } from '../../../types';

const netTrappingCreatures: Creature[] = [
	{
		name: `Swamp lizard`,
		id: 23,
		aliases: ['swamp lizard'],
		level: 29,
		hunterXp: 152,
		table: new LootTable().every('Swamp lizard'),
		huntTechnique: 'net trapping',
		multiTraps: true,
		catchTime: 12,
		slope: 1,
		intercept: 15
	},
	{
		name: `Orange salamander`,
		id: 24,
		aliases: ['orange salamander'],
		level: 47,
		hunterXp: 224,
		table: new LootTable().every('Orange salamander'),
		huntTechnique: 'net trapping',
		multiTraps: true,
		catchTime: 14,
		slope: 1.2,
		intercept: 5
	},
	{
		name: `Red salamander`,
		id: 25,
		aliases: ['red salamander'],
		level: 59,
		hunterXp: 272,
		table: new LootTable().every('Red salamander'),
		huntTechnique: 'net trapping',
		multiTraps: true,
		catchTime: 14,
		slope: 0.9,
		intercept: 25
	},
	{
		name: `Black salamander`,
		id: 26,
		aliases: ['Black salamander'],
		level: 67,
		hunterXp: 319.2,
		table: new LootTable().every('Black salamander'),
		huntTechnique: 'net trapping',
		multiTraps: true,
		wildy: true,
		prayerLvl: 43,
		catchTime: 12,
		slope: 1.2,
		intercept: -5
	}
];

export default netTrappingCreatures;
