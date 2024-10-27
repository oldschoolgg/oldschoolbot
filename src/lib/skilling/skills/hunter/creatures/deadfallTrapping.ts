import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';

import type { Creature } from '../../../types';
import { HunterTechniqueEnum } from '../../../types';

const deadfallTrappingCreatures: Creature[] = [
	{
		name: 'Wild kebbit',
		id: 14,
		aliases: ['wild kebbit'],
		level: 23,
		hunterXP: 128,
		table: new LootTable().every('Bones').every('Kebbit claws'),
		huntTechnique: HunterTechniqueEnum.DeadfallTrapping,
		catchTime: 17,
		slope: 1,
		intercept: 15
	},
	{
		name: 'Barb-tailed kebbit',
		id: 15,
		aliases: ['barb-tailed kebbit', 'barb kebbit', 'barb tail kebbit'],
		level: 33,
		hunterXP: 168,
		table: new LootTable().every('Bones').every('Barb-tail harpoon'),
		huntTechnique: HunterTechniqueEnum.DeadfallTrapping,
		catchTime: 20,
		slope: 1.2,
		intercept: 17
	},
	{
		name: 'Prickly kebbit',
		id: 16,
		aliases: ['prickly kebbit'],
		level: 37,
		hunterXP: 204,
		table: new LootTable().every('Bones').every('Kebbit spike'),
		huntTechnique: HunterTechniqueEnum.DeadfallTrapping,
		catchTime: 17,
		slope: 1.3,
		intercept: 10
	},
	{
		name: 'Sabre-toothed kebbit',
		id: 17,
		aliases: ['sabre-toothed kebbit', 'sabre kebbit', 'sab tooth kebbit'],
		level: 51,
		hunterXP: 200,
		table: new LootTable().every('Bones').every('Kebbit teeth'),
		huntTechnique: HunterTechniqueEnum.DeadfallTrapping,
		catchTime: 25,
		slope: 1.6,
		intercept: -3
	},
	{
		name: 'Maniacal monkey',
		id: 18,
		aliases: ['maniacal monkey'],
		level: 60,
		hunterXP: 1000,
		itemsConsumed: new Bank().add('Banana', 1),
		table: new LootTable().every('Damaged monkey tail').tertiary(5000, 'Monkey tail'),
		huntTechnique: HunterTechniqueEnum.DeadfallTrapping,
		catchTime: 33,
		qpRequired: 175,
		slope: 0.8,
		intercept: 20
	}
];

export default deadfallTrappingCreatures;
