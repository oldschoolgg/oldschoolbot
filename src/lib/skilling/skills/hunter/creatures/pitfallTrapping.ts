import LootTable from 'oldschooljs/dist/structures/LootTable';

import type { Creature } from '../../../types';
import { HunterTechniqueEnum } from '../../../types';

const pitfallTrappingCreatures: Creature[] = [
	{
		name: 'Spined larupia',
		id: 27,
		aliases: ['spined larupia'],
		level: 31,
		hunterXP: 180,
		table: new LootTable().every('Big bones').add('Larupia fur').add('Tatty larupia fur').every('Raw larupia'),
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
		table: new LootTable().every('Big bones').add('Graahk fur').add('Tatty graahk fur').every('Raw graahk'),
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
		table: new LootTable().every('Big bones').add('Kyatt fur').add('Tatty kyatt fur').every('Raw kyatt'),
		huntTechnique: HunterTechniqueEnum.PitfallTrapping,
		multiTraps: true,
		catchTime: 45,
		slope: 0.5,
		intercept: 15
	},
	{
		name: 'Sunlight antelope',
		id: 45,
		aliases: ['sunlight antelope'],
		level: 72,
		hunterXP: 380,
		table: new LootTable()
			.every('Big bones')
			.every('Sunlight antelope antler')
			.every('Sunlight antelope fur')
			.every('Raw sunlight antelope')
			.every('Sunfire splinters', [2, 6]),
		huntTechnique: HunterTechniqueEnum.PitfallTrapping,
		multiTraps: false,
		catchTime: 17,
		slope: 0.5,
		intercept: 100
	},
	{
		name: 'Moonlight antelope',
		id: 49,
		aliases: ['moonlight antelope'],
		level: 91,
		hunterXP: 450,
		table: new LootTable()
			.every('Big bones')
			.every('Moonlight antelope antler')
			.every('Moonlight antelope fur')
			.every('Raw moonlight antelope'),
		huntTechnique: HunterTechniqueEnum.PitfallTrapping,
		multiTraps: false,
		catchTime: 19,
		slope: 0.5,
		intercept: 100
	}
];

export default pitfallTrappingCreatures;
