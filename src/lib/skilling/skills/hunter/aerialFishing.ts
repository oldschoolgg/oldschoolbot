import { LootTable } from 'oldschooljs';

import type { Creature } from '../../types';
import { HunterTechniqueEnum } from '../../types';

const aerialFishingCreatures: Creature[] = [
	{
		name: 'Bluegill',
		id: 37,
		aliases: ['bluegill'],
		level: 35,
		hunterXP: 16.5,
		fishLvl: 43,
		fishingXP: 11.5,
		table: new LootTable().tertiary(20_000, 'Golden tench'),
		huntTechnique: HunterTechniqueEnum.AerialFishing,
		catchTime: 2,
		slope: 0,
		intercept: 100
	},
	{
		name: 'Common tench',
		id: 38,
		aliases: ['common tench'],
		level: 51,
		hunterXP: 45,
		fishLvl: 56,
		fishingXP: 40,
		table: new LootTable().tertiary(20_000, 'Golden tench'),
		huntTechnique: HunterTechniqueEnum.AerialFishing,
		catchTime: 2,
		slope: 0,
		intercept: 100
	},
	{
		name: 'Mottled eel',
		id: 39,
		aliases: ['mottled eel'],
		level: 68,
		hunterXP: 90,
		fishLvl: 73,
		fishingXP: 65,
		table: new LootTable().tertiary(20_000, 'Golden tench'),
		huntTechnique: HunterTechniqueEnum.AerialFishing,
		catchTime: 2,
		slope: 0,
		intercept: 100
	},
	{
		name: 'Greater siren',
		id: 40,
		aliases: ['greater siren'],
		level: 87,
		hunterXP: 130,
		fishLvl: 91,
		fishingXP: 100,
		table: new LootTable().tertiary(20_000, 'Golden tench'),
		huntTechnique: HunterTechniqueEnum.AerialFishing,
		catchTime: 2,
		slope: 0,
		intercept: 100
	}
];

export default aerialFishingCreatures;
