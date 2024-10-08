import { LootTable } from 'oldschooljs';

import type { Creature } from '../../types';
import { HunterTechniqueEnum } from '../../types';

const driftNetCreatures: Creature[] = [
	{
		name: 'Fish shoal',
		id: 41,
		aliases: ['fish shoal'],
		level: 44,
		hunterXP: 720,
		fishLvl: 47,
		fishingXP: 565,
		table: new LootTable()
			.add('Oyster')
			.add('Numulite', [5, 14])
			.add('Pufferfish')
			.add('Raw anchovies')
			.add('Raw sardine')
			.add('Raw tuna')
			// TODO: Check wiki in future for accurate drop rates
			.tertiary(590, 'Unidentified small fossil')
			.tertiary(1088, 'Unidentified medium fossil')
			.tertiary(1733, 'Unidentified large fossil')
			.tertiary(5920, 'Unidentified rare fossil')
			.tertiary(1000, 'Clue scroll (medium)'),
		huntTechnique: HunterTechniqueEnum.DriftNet,
		catchTime: 2,
		slope: 0,
		intercept: 100
	}
];

export default driftNetCreatures;
