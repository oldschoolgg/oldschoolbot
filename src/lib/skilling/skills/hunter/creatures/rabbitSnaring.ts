import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';

import type { Creature } from '../../../types';
import { HunterTechniqueEnum } from '../../../types';

const rabbitSnaringCreatures: Creature[] = [
	{
		name: 'White rabbit',
		id: 30,
		aliases: ['white rabbit', 'rabbit'],
		level: 27,
		hunterXP: 144,
		itemsConsumed: new Bank().add('Ferret', 1),
		table: new LootTable().every('Bones').every('Raw rabbit').every('Rabbit foot'),
		huntTechnique: HunterTechniqueEnum.RabbitSnaring,
		multiTraps: true,
		catchTime: 40,
		slope: 1.2,
		intercept: 34
	}
];

export default rabbitSnaringCreatures;
