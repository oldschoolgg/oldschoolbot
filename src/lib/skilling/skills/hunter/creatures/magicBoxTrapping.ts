import LootTable from 'oldschooljs/dist/structures/LootTable';

import { resolveNameBank } from '../../../../util';
import { Creature } from '../../../types';

const magicBoxTrappingCreatures: Creature[] = [
	{
		name: `Imp`,
		aliases: ['imp'],
		level: 71,
		hunterXp: 450,
		itemsRequired: resolveNameBank({ 'Magic box': 1 }),
		itemsConsumed: resolveNameBank({ 'Magic box': 1 }),
		table: new LootTable().every('Imp-in-a-box(2)'),
		huntTechnique: 'magic box trapping',
		multiTraps: true,
		catchTime: 20,
		slope: 0.5,
		intercept: 40
	}
];

export default magicBoxTrappingCreatures;
