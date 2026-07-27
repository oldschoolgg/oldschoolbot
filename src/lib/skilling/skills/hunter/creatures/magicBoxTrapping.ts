import { Bank, LootTable } from 'oldschooljs';

import type { Creature } from '@/lib/skilling/types.js';
import { HunterTechniqueEnum } from '@/lib/skilling/types.js';

const magicBoxTrappingCreatures: Creature[] = [
	{
		name: 'Imp',
		id: 22,
		aliases: ['imp'],
		level: 71,
		hunterXP: 450,
		itemsConsumed: new Bank().add('Magic box', 1),
		table: new LootTable().every('Imp-in-a-box(2)'),
		huntTechnique: HunterTechniqueEnum.MagicBoxTrapping,
		multiTraps: true,
		catchTime: 120,
		slope: 0.5,
		intercept: 40
	}
];

export default magicBoxTrappingCreatures;
