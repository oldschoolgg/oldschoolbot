import LootTable from 'oldschooljs/dist/structures/LootTable';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { Creature } from '../../../types';

const butterflyNettingCreatures: Creature[] = [
	{
		name: `Ruby harvest`,
		aliases: ['ruby harvest'],
		level: 15,
		hunterXp: 24,
		itemsRequired: resolveNameBank({ 'Butterfly net': 1 }),
		itemsConsumed: resolveNameBank({ 'Butterfly jar': 1 }),
		table: new LootTable().every('Ruby harvest'),
		huntTechnique: 'butterfly netting',
		catchTime: 8,
		slope: 1.3,
		intercept: 35
	},
	{
		name: `Sapphire glacialis`,
		aliases: ['sapphire glacialis'],
		level: 25,
		hunterXp: 34,
		itemsRequired: resolveNameBank({ 'Butterfly net': 1 }),
		itemsConsumed: resolveNameBank({ 'Butterfly jar': 1 }),
		table: new LootTable().every('Sapphire glacialis'),
		huntTechnique: 'butterfly netting',
		catchTime: 8,
		slope: 1.2,
		intercept: 40
	},
	{
		name: `Snowy knight`,
		aliases: ['snowy knight'],
		level: 35,
		hunterXp: 44,
		itemsRequired: resolveNameBank({ 'Butterfly net': 1 }),
		itemsConsumed: resolveNameBank({ 'Butterfly jar': 1 }),
		table: new LootTable().every('Snowy knight'),
		huntTechnique: 'butterfly netting',
		catchTime: 9,
		slope: 1.35,
		intercept: 30
	},
	{
		name: `Black warlock`,
		aliases: ['black warlock'],
		level: 45,
		hunterXp: 54,
		itemsRequired: resolveNameBank({ 'Butterfly net': 1 }),
		itemsConsumed: resolveNameBank({ 'Butterfly jar': 1 }),
		table: new LootTable().every('Black warlock'),
		huntTechnique: 'butterfly netting',
		catchTime: 9,
		slope: 1.35,
		intercept: 35
	}
];

export default butterflyNettingCreatures;
