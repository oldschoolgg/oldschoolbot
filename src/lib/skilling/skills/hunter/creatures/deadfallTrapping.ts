import LootTable from 'oldschooljs/dist/structures/LootTable';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { Creature } from '../../../types';

const deadfallTrappingCreatures: Creature[] = [
	{
		name: `Wild kebbit`,
		aliases: ['wild kebbit'],
		level: 23,
		hunterXp: 128,
		table: new LootTable().every('Bones').every('Kebbit claws'),
		huntTechnique: 'deadfall trapping',
		catchTime: 20,
		slope: 1,
		intercept: 15
	},
	{
		name: `Barb-tailed kebbit`,
		aliases: ['barb-tailed kebbit'],
		level: 33,
		hunterXp: 168,
		table: new LootTable().every('Bones').every('Barb-tail harpoon'),
		huntTechnique: 'deadfall trapping',
		catchTime: 20,
		slope: 1.2,
		intercept: 17
	},
	{
		name: `Prickly kebbit`,
		aliases: ['prickly kebbit'],
		level: 37,
		hunterXp: 204,
		table: new LootTable().every('Bones').every('Kebbit spike'),
		huntTechnique: 'deadfall trapping',
		catchTime: 20,
		slope: 1.3,
		intercept: 10
	},
	{
		name: `Sabre-toothed kebbit`,
		aliases: ['sabre-toothed kebbit'],
		level: 51,
		hunterXp: 200,
		table: new LootTable().every('Bones').every('Kebbit teeth'),
		huntTechnique: 'deadfall trapping',
		catchTime: 20,
		slope: 1.6,
		intercept: -3
	},
	{
		name: `Maniacal monkey`,
		aliases: ['maniacal monkey'],
		level: 60,
		hunterXp: 1000,
		itemsConsumed: resolveNameBank({ Banana: 1 }),
		table: new LootTable().every('Damaged monkey tail').tertiary(5000, 'Monkey tail'),
		huntTechnique: 'deadfall trapping',
		catchTime: 20,
		qpRequired: 175,
		slope: 1.2,
		intercept: 20
	}
];

export default deadfallTrappingCreatures;
