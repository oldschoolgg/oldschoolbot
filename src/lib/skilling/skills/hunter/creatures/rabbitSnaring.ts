import LootTable from 'oldschooljs/dist/structures/LootTable';

import { resolveNameBank } from '../../../../util';
import { Creature } from '../../../types';

const rabbitSnaringCreatures: Creature[] = [
	{
		name: `White rabbit`,
		aliases: ['white rabbit'],
		level: 27,
		hunterXp: 144,
		itemsRequired: resolveNameBank({ 'Rabbit snare': 1 }),
		itemsConsumed: resolveNameBank({ 'Ferret': 1}),
		table: new LootTable().every('Bones').every('Raw rabbit').every('Rabbit foot'),
		huntTechnique: 'rabbit snaring',
		multiTraps: true,
		catchTime: 0
	}
];

export default rabbitSnaringCreatures;
