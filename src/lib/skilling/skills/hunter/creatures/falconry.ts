import { LootTable } from 'oldschooljs';

import type { Creature } from '../../../types';
import { HunterTechniqueEnum } from '../../../types';

const falconryCreatures: Creature[] = [
	{
		name: 'Spotted kebbit',
		id: 19,
		aliases: ['spotted kebbit'],
		level: 43,
		hunterXP: 104,
		table: new LootTable().every('Bones').every('Spotted kebbit fur'),
		huntTechnique: HunterTechniqueEnum.Falconry,
		catchTime: 4,
		slope: 1,
		intercept: 10
	},
	{
		name: 'Dark kebbit',
		id: 20,
		aliases: ['dark kebbit'],
		level: 57,
		hunterXP: 132,
		table: new LootTable().every('Bones').every('Dark kebbit fur'),
		huntTechnique: HunterTechniqueEnum.Falconry,
		catchTime: 4.8,
		slope: 1,
		intercept: 10
	},
	{
		name: 'Dashing kebbit',
		id: 21,
		aliases: ['dashing kebbit'],
		level: 69,
		hunterXP: 156,
		table: new LootTable().every('Bones').every('Dashing kebbit fur'),
		huntTechnique: HunterTechniqueEnum.Falconry,
		catchTime: 6,
		slope: 1,
		intercept: 10
	}
];

export default falconryCreatures;
