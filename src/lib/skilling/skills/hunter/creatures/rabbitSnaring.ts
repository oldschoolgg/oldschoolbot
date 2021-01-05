import LootTable from 'oldschooljs/dist/structures/LootTable';

import { resolveNameBank } from '../../../../util';
import { Creature } from '../../../types';

const rabbitSnaringCreatures: Creature[] = [
	{
		name: `White rabbit`,
		id: 30,
		aliases: ['white rabbit'],
		level: 27,
		hunterXp: 144,
		itemsConsumed: resolveNameBank({ Ferret: 1 }),
		table: new LootTable().every('Bones').every('Raw rabbit').every('Rabbit foot'),
		huntTechnique: 'rabbit snaring',
		multiTraps: true,
		catchTime: 20,
		slope: 1.3,
		intercept: 5
	}
];

export default rabbitSnaringCreatures;
