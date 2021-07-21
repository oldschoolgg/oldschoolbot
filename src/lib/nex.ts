import { Time } from 'e';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { nexCL } from './data/CollectionsExport';
import { GearSetupTypes, GearStat } from './gear';
import { KillableMonster } from './minions/types';
import { makeKillTable } from './util/setCustomMonster';

export const nexLootTable = new LootTable()
	.every('Big bones')
	.add(new LootTable().every('Saradomin brew(4)', [2, 15]).every('Super restore(4)', [1, 5]))
	.add('Magic logs', 375)
	.add('Green dragonhide', 400)
	.add('Uncut dragonstone', 20)
	.add('Onyx bolts (e)', 375)
	.add('Grimy avantoe', 75)
	.add('Grimy dwarf weed', 75)
	.add('Grimy torstol', 40)
	.add('Torstol seed', 12)
	.add('Magic seed', 5)
	.tertiary(1500, 'Ancient emblem')
	.tertiary(5, 'Tradeable mystery box')
	.tertiary(20, 'Clue scroll (grandmaster)')
	.tertiary(3000, 'Bloodsoaked feather');

export const NexMonster: KillableMonster = {
	id: 46_274,
	name: 'Nex',
	aliases: ['nex'],
	timeToFinish: Time.Minute * 25,
	notifyDrops: nexCL,
	table: {
		kill: makeKillTable(nexLootTable)
	},
	emoji: '',
	wildy: false,
	difficultyRating: 10,
	qpRequired: 0,
	groupKillable: true,
	respawnTime: Time.Second * 10,
	levelRequirements: {
		prayer: 95
	},
	healAmountNeeded: 120 * 20,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackRanged],
	minimumGearRequirements: {
		[GearSetupTypes.Range]: {
			[GearStat.AttackRanged]: 33 + 20 + 4 + 10 + 7 + 8 + 70 + 12 + 7
		}
	}
};
