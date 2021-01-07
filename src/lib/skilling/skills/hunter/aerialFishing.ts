import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Creature } from '../../types';

const aerialFishingCreatures: Creature[] = [
	{
		name: `Bluegill`,
		id: 37,
		aliases: ['bluegill'],
		level: 35,
		hunterXp: 16.5,
		fishLvl: 43,
		fishingXp: 11.5,
		table: new LootTable().tertiary(20_000, 'Golden tench'),
		huntTechnique: 'aerial fishing',
		catchTime: 2,
		slope: 0,
		intercept: 100
	},
	{
		name: `Common tench`,
		id: 38,
		aliases: ['common tench'],
		level: 51,
		hunterXp: 45,
		fishLvl: 56,
		fishingXp: 40,
		table: new LootTable().tertiary(20_000, 'Golden tench'),
		huntTechnique: 'aerial fishing',
		catchTime: 2,
		slope: 0,
		intercept: 100
	},
	{
		name: `Mottled eel`,
		id: 39,
		aliases: ['mottled eel'],
		level: 68,
		hunterXp: 90,
		fishLvl: 73,
		fishingXp: 65,
		table: new LootTable().tertiary(20_000, 'Golden tench'),
		huntTechnique: 'aerial fishing',
		catchTime: 2,
		slope: 0,
		intercept: 100
	},
	{
		name: `Greater siren`,
		id: 40,
		aliases: ['greater siren'],
		level: 87,
		hunterXp: 130,
		fishLvl: 91,
		fishingXp: 100,
		table: new LootTable().tertiary(20_000, 'Golden tench'),
		huntTechnique: 'aerial fishing',
		catchTime: 2,
		slope: 0,
		intercept: 100
	}
];

export default aerialFishingCreatures;
