import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Creature } from '../../../types';

const falconryCreatures: Creature[] = [
	{
		name: `Spotted kebbit`,
		aliases: ['spotted kebbit'],
		level: 43,
		hunterXp: 104,
		table: new LootTable().every('Bones').every('Spotted kebbit fur'),
		huntTechnique: 'falconry',
		catchTime: 0
	},
	{
		name: `Dark kebbit`,
		aliases: ['dark kebbit'],
		level: 57,
		hunterXp: 132,
		table: new LootTable().every('Bones').every('Dark kebbit fur'),
		huntTechnique: 'falconry',
		catchTime: 0
	},
	{
		name: `Dashing kebbit`,
		aliases: ['dashing kebbit'],
		level: 69,
		hunterXp: 156,
		table: new LootTable().every('Bones').every('Dashing kebbit fur'),
		huntTechnique: 'falconry',
		catchTime: 0
	}
];

export default falconryCreatures;
