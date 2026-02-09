import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';

import { GearStat } from '@oldschoolgg/gear';
import { Time } from '@oldschoolgg/toolkit';
import { LootTable, Monsters, resolveItems } from 'oldschooljs';

const FishTable = new LootTable()
	.add('Raw sea turtle', [1, 10])
	.add('Raw dark crab', [1, 10])
	.add('Raw anglerfish', [1, 20])
	.add('Raw shark', [1, 30])
	.add('Raw monkfish', [1, 40])
	.add('Raw karambwan', [1, 40])
	.add('Raw swordfish', [1, 50])
	.add('Raw bass', [1, 60])
	.add('Raw lobster', [1, 70])
	.add('Raw trout', [1, 80])
	.add('Raw tuna', [1, 90]);

const KrakenTable = new LootTable()
	.every(FishTable, [2, 6])
	.tertiary(3, FishTable, 2)
	.add('Coins', [50_000, 1_000_000])
	.add('Pirate boots')
	.add('Harpoon')
	.add('Kraken tentacle')
	.add('Crystal key')
	.add('Seaweed')
	.add('Manta ray', [50, 100])
	.add('Water rune', [20, 500])
	.tertiary(400, 'Fish sack')
	.tertiary(1200, 'Pufferfish')
	.tertiary(100_000, 'Fishing trophy')
	.tertiary(100, 'Clue scroll (grandmaster)')
	.tertiary(200, 'Squid dye');

export const SeaKraken: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.SEA_KRAKEN,
	name: 'Sea Kraken',
	aliases: ['sea kraken'],
	timeToFinish: Time.Minute * 17,
	table: KrakenTable,
	emoji: '',
	notifyDrops: resolveItems(['Fish sack', 'Fishing trophy', 'Pufferfish']),
	wildy: false,
	difficultyRating: 7,
	qpRequired: 0,
	healAmountNeeded: 20 * 20,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackMagic],
	minimumGearRequirements: {
		range: {
			[GearStat.DefenceMagic]: 150,
			[GearStat.AttackRanged]: 80
		}
	},
	groupKillable: true,
	respawnTime: Time.Second * 20,
	levelRequirements: {
		prayer: 43,
		ranged: 105,
		slayer: 101
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 10
		}
	},
	baseMonster: Monsters.CommanderZilyana
};
