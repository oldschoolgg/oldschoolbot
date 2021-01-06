import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Creature } from '../../../types';

const falconryCreatures: Creature[] = [
	{
		name: `Spotted kebbit`,
		id: 19,
		aliases: ['spotted kebbit'],
		level: 43,
		hunterXp: 104,
		table: new LootTable().every('Bones').every('Spotted kebbit fur'),
		huntTechnique: 'falconry',
		catchTime: 4,
		slope: 1,
		intercept: 10
	},
	{
		name: `Dark kebbit`,
		id: 20,
		aliases: ['dark kebbit'],
		level: 57,
		hunterXp: 132,
		table: new LootTable().every('Bones').every('Dark kebbit fur'),
		huntTechnique: 'falconry',
		catchTime: 4.8,
		slope: 1,
		intercept: 10
	},
	{
		name: `Dashing kebbit`,
		id: 21,
		aliases: ['dashing kebbit'],
		level: 69,
		hunterXp: 156,
		table: new LootTable().every('Bones').every('Dashing kebbit fur'),
		huntTechnique: 'falconry',
		catchTime: 6,
		slope: 1,
		intercept: 10
	}
];

export default falconryCreatures;
