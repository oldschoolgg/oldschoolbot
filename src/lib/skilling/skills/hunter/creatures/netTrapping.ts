import LootTable from 'oldschooljs/dist/structures/LootTable';

import { resolveNameBank } from '../../../../util';
import { Creature } from '../../../types';

const netTrappingCreatures: Creature[] = [
	{
		name: `Swamp lizard`,
		aliases: ['swamp lizard'],
		level: 29,
		hunterXp: 152,
		itemsRequired: resolveNameBank({ Rope: 1, 'Small fishing net': 1 }),
		table: new LootTable().every('Swamp lizard'),
		huntTechnique: 'net trapping',
		multiTraps: true,
		catchTime: 12,
		slope: 1,
		intercept: 15
	},
	{
		name: `Orange salamander`,
		aliases: ['orange salamander'],
		level: 47,
		hunterXp: 224,
		itemsRequired: resolveNameBank({ Rope: 1, 'Small fishing net': 1 }),
		table: new LootTable().every('Orange salamander'),
		huntTechnique: 'net trapping',
		multiTraps: true,
		catchTime: 14,
		slope: 1.2,
		intercept: 5
	},
	{
		name: `Red salamander`,
		aliases: ['red salamander'],
		level: 59,
		hunterXp: 272,
		itemsRequired: resolveNameBank({ Rope: 1, 'Small fishing net': 1 }),
		table: new LootTable().every('Red salamander'),
		huntTechnique: 'net trapping',
		multiTraps: true,
		catchTime: 14,
		slope: 0.9,
		intercept: 25
	},
	{
		name: `Black salamander`,
		aliases: ['Black salamander'],
		level: 67,
		hunterXp: 319.2,
		itemsRequired: resolveNameBank({ Rope: 1, 'Small fishing net': 1 }),
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
