import LootTable from 'oldschooljs/dist/structures/LootTable';

import { MysteryBoxes } from '../../../../data/openables';
import { Creature, HunterTechniqueEnum } from '../../../types';

const customBSOCreatures: Creature[] = [
	{
		name: `Sand Gecko`,
		id: 3251,
		aliases: ['sand gecko'],
		level: 120,
		hunterXP: 2300,
		table: new LootTable()
			.tertiary(6000, 'Sandy')
			.tertiary(10, MysteryBoxes)
			.tertiary(200, 'Clue scroll grandmaster')
			.add('Sand')
			.add('Sandworms', [10, 100]),
		qpRequired: 3,
		huntTechnique: HunterTechniqueEnum.Tracking,
		catchTime: 91,
		slope: 0,
		intercept: 99
	}
];

export default customBSOCreatures;
