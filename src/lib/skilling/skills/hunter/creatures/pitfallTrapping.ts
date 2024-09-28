import { LootTable } from 'oldschooljs';

import type { Creature } from '../../../types';
import { HunterTechniqueEnum } from '../../../types';

const pitfallTrappingCreatures: Creature[] = [
	{
		name: 'Spined larupia',
		id: 27,
		aliases: ['spined larupia'],
		level: 31,
		hunterXP: 180,
		table: new LootTable().every('Big bones').add('Larupia fur').add('Tatty larupia fur'),
		huntTechnique: HunterTechniqueEnum.PitfallTrapping,
		multiTraps: true,
		catchTime: 35,
		slope: 0.4,
		intercept: 15
	},
	{
		name: 'Horned graahk',
		id: 28,
		aliases: ['horned graahk'],
		level: 41,
		hunterXP: 240,
		table: new LootTable().every('Big bones').add('Graahk fur').add('Tatty graahk fur'),
		huntTechnique: HunterTechniqueEnum.PitfallTrapping,
		multiTraps: true,
		catchTime: 50,
		slope: 0.7,
		intercept: 15
	},
	{
		name: 'Sabre-toothed kyatt',
		id: 29,
		aliases: ['sabre-toothed kyatt'],
		level: 55,
		hunterXP: 300,
		table: new LootTable().every('Big bones').add('Kyatt fur').add('Tatty kyatt fur'),
		huntTechnique: HunterTechniqueEnum.PitfallTrapping,
		multiTraps: true,
		catchTime: 45,
		slope: 0.5,
		intercept: 15
	}
];

export default pitfallTrappingCreatures;
