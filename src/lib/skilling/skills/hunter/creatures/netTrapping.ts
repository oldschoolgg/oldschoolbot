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
		catchTime: 0
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
		catchTime: 0
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
		catchTime: 0
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
		catchTime: 0
	}
];

export default netTrappingCreatures;
