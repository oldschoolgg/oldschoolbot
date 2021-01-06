import LootTable from 'oldschooljs/dist/structures/LootTable';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { Creature } from '../../../types';

const butterflyNettingCreatures: Creature[] = [
	{
		name: `Ruby harvest`,
		id: 10,
		aliases: ['ruby harvest'],
		level: 15,
		hunterXp: 24,
		itemsConsumed: resolveNameBank({ 'Butterfly jar': 1 }),
		table: new LootTable().every('Ruby harvest'),
		huntTechnique: 'butterfly netting',
		catchTime: 4.8,
		slope: 1.3,
		intercept: 35
	},
	{
		name: `Sapphire glacialis`,
		id: 11,
		aliases: ['sapphire glacialis'],
		level: 25,
		hunterXp: 34,
		itemsConsumed: resolveNameBank({ 'Butterfly jar': 1 }),
		table: new LootTable().every('Sapphire glacialis'),
		huntTechnique: 'butterfly netting',
		catchTime: 5.8,
		slope: 1.2,
		intercept: 40
	},
	{
		name: `Snowy knight`,
		id: 12,
		aliases: ['snowy knight'],
		level: 35,
		hunterXp: 44,
		itemsConsumed: resolveNameBank({ 'Butterfly jar': 1 }),
		table: new LootTable().every('Snowy knight'),
		huntTechnique: 'butterfly netting',
		catchTime: 6,
		slope: 1.35,
		intercept: 30
	},
	{
		name: `Black warlock`,
		id: 13,
		aliases: ['black warlock'],
		level: 45,
		hunterXp: 54,
		itemsConsumed: resolveNameBank({ 'Butterfly jar': 1 }),
		table: new LootTable().every('Black warlock'),
		huntTechnique: 'butterfly netting',
		catchTime: 5,
		slope: 1.35,
		intercept: 35
	}
];

export default butterflyNettingCreatures;
