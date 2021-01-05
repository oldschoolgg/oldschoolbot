import LootTable from 'oldschooljs/dist/structures/LootTable';

import { resolveNameBank } from '../../../../util';
import { Creature } from '../../../types';

const pitfallTrappingCreatures: Creature[] = [
	{
		name: `Spined larupia`,
		id: 27,
		aliases: ['spined larupia'],
		level: 31,
		hunterXp: 180,
		table: new LootTable().every('Big bones').add('Larupia fur').add('Tatty larupia fur'),
		huntTechnique: 'pitfall trapping',
		multiTraps: true,
		catchTime: 30,
		slope: 0.4,
		intercept: 15
	},
	{
		name: `Horned graahk`,
		id: 28,
		aliases: ['horned graahk'],
		level: 41,
		hunterXp: 240,
		table: new LootTable().every('Big bones').add('Graahk fur').add('Tatty graahk fur'),
		huntTechnique: 'pitfall trapping',
		multiTraps: true,
		catchTime: 30,
		slope: 0.7,
		intercept: 15
	},
	{
		name: `Sabre-toothed kyatt`,
		id: 29,
		aliases: ['sabre-toothed kyatt'],
		level: 55,
		hunterXp: 300,
		table: new LootTable().every('Big bones').add('Kyatt fur').add('Tatty kyatt fur'),
		huntTechnique: 'pitfall trapping',
		multiTraps: true,
		catchTime: 30,
		slope: 0.5,
		intercept: 15
	}
];

export default pitfallTrappingCreatures;
