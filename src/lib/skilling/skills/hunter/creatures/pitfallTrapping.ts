import LootTable from 'oldschooljs/dist/structures/LootTable';

import { resolveNameBank } from '../../../../util';
import { Creature } from '../../../types';

const pitfallTrappingCreatures: Creature[] = [
	{
		name: `Spined larupia`,
		aliases: ['spined larupia'],
		level: 31,
		hunterXp: 180,
		itemsRequired: resolveNameBank({ 'Teasing stick': 1 }),
		table: new LootTable().every('Big bones').add('Larupia fur').add('Tatty larupia fur'),
		huntTechnique: 'pitfall trapping',
		multiTraps: true,
		catchTime: 0
	},
	{
		name: `Horned graahk`,
		aliases: ['horned graahk'],
		level: 41,
		hunterXp: 240,
		itemsRequired: resolveNameBank({ 'Teasing stick': 1 }),
		table: new LootTable().every('Big bones').add('Graahk fur').add('Tatty graahk fur'),
		huntTechnique: 'pitfall trapping',
		multiTraps: true,
		catchTime: 0
	},
	{
		name: `Sabre-toothed kyatt`,
		aliases: ['sabre-toothed kyatt'],
		level: 55,
		hunterXp: 300,
		itemsRequired: resolveNameBank({ 'Teasing stick': 1 }),
		table: new LootTable().every('Big bones').add('Kyatt fur').add('Tatty kyatt fur'),
		huntTechnique: 'pitfall trapping',
		multiTraps: true,
		catchTime: 0
	}
];

export default pitfallTrappingCreatures;
