import { Time } from 'e';
import RareDropTable from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import {
	brokenPernixOutfit,
	brokenTorvaOutfit,
	brokenVirtusOutfit,
	nexUniqueDrops,
	pernixOutfit,
	torvaOutfit,
	virtusOutfit
} from './data/CollectionsExport';
import { GearStat } from './gear';
import type { KillableMonster } from './minions/types';
import getOSItem from './util/getOSItem';
import itemID from './util/itemID';
import { makeKillTable } from './util/setCustomMonster';

export const nexBrokenArmorDetails = [
	[getOSItem('Armadylean components'), brokenPernixOutfit, pernixOutfit],
	[getOSItem('Bandosian components'), brokenTorvaOutfit, torvaOutfit],
	[getOSItem('Ancestral components'), brokenVirtusOutfit, virtusOutfit]
] as const;

export const nexLootTable = new LootTable()
	.every('Big bones')
	.add(new LootTable().every('Saradomin brew(4)', 10).every('Super restore(4)', 30))
	.add(new LootTable().every('Saradomin brew(4)', 30).every('Super restore(4)', 10))
	.add('Magic logs', 375)
	.add('Coal', 2400)
	.add('Runite ore', 80)
	.add('Green dragonhide', 400)
	.add('Uncut dragonstone', 20)
	.add('Onyx bolts (e)', 375)
	.add('Grimy avantoe', 75)
	.add('Grimy dwarf weed', 75)
	.add('Grimy torstol', 40)
	.add('Torstol seed', 12)
	.add('Magic seed', 5)
	.add(RareDropTable, 2, 1, { multiply: true })
	.tertiary(1500, 'Ancient emblem')
	.tertiary(16, 'Clue scroll (hard)')
	.tertiary(19, new LootTable().add('Clue scroll (elite)', 1, 99).add('Clue scroll (master)', 1, 1))
	.tertiary(20, 'Clue scroll (grandmaster)')
	.tertiary(86, 'Ancient hilt')
	.tertiary(3000, 'Bloodsoaked feather');

export const NexMonster: KillableMonster = {
	id: 46_274,
	name: 'Nex',
	aliases: ['nex'],
	timeToFinish: Time.Minute * 25,
	notifyDrops: [...nexUniqueDrops, itemID('Bloodsoaked feather')],
	table: makeKillTable(nexLootTable),
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
		range: {
			[GearStat.AttackRanged]: 33 + 20 + 4 + 10 + 7 + 8 + 70 + 12 + 7
		}
	}
};

export const NEX_UNIQUE_DROPRATE = (numPlayers: number) => 80 + numPlayers * 2;
